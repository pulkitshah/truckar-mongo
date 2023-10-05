const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Order = require("../../models/Order");
const auth = require("../../middlleware/auth");
const createFilterAggPipeline = require("../../utils/getAggregationPipeline");
const getFiscalYearTimestamps = require("../../utils/getFiscalYear");

const router = express.Router();

// @route   POST api/order
// @desc    Create Order
// @access  Private
router.post(
  "/",
  [auth, [check("orderNo", "Please enter Order No.").not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get fields
      const updates = Object.keys(req.body);
      const orderFields = {};
      orderFields.createdBy = req.user.id;
      updates.forEach((update) => (orderFields[update] = req.body[update]));

      try {
        // Create
        order = new Order(orderFields);
        await order.save();
        res.send(order);
      } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/orders/
// @desc    Get Orders created by user
// @access  Private

/**
 * Query blog posts by user -> paginated results and a total count.
 * @param accountId {ObjectId} ID of user to retrieve blog posts for
 * @param startRow {Number} First row to return in results
 * @param endRow {Number} Last row to return in results
 * @param [filter] {Object} Optional extra matching query object
 * @param [sort] {Object} Optional sort query object
 * @returns {Object} Object -> `{ rows, count }`
 */

router.get("/:id", auth, async (req, res) => {
  const {
    account,
    startRow,
    endRow,
    filter = {},
    sort = { saleDate: -1, orderNo: -1 },
  } = JSON.parse(req.params.id);

  console.log({
    account,
    startRow,
    endRow,
    filter,
    sort,
  });

  // if (!(accountId instanceof mongoose.Types.ObjectId)) {
  //   throw new Error("accountId must be ObjectId");
  // } else if (typeof startRow !== "number") {
  //   throw new Error("startRow must be number");
  // } else if (typeof endRow !== "number") {
  //   throw new Error("endRow must be number");
  // }

  let matches = { account: new mongoose.Types.ObjectId(account) };

  let query = [
    // filter the results by our accountId
    {
      $match: Object.assign(matches),
    },
  ];

  // filter according to filterModel object
  if (filter.orderNo) {
    const orderNoQuery = createFilterAggPipeline({ orderNo: filter.orderNo });
    query.push(orderNoQuery[0]);
  }

  if (filter.customer) {
    const customerQuery = createFilterAggPipeline({
      customer: filter.customer,
    });
    query.push(customerQuery[0]);
  }

  if (filter.vehicleNumber) {
    const vehicleNumberQuery = createFilterAggPipeline({
      vehicleNumber: filter.vehicleNumber,
    });
    query.push(vehicleNumberQuery[0]);
  }

  let lookups = [
    {
      $lookup: {
        from: "accounts",
        localField: "account",
        foreignField: "_id",
        as: "account",
      },
    },
    // each blog has a single user (author) so flatten it using $unwind
    { $unwind: "$account" },
    {
      $lookup: {
        from: "parties",
        let: {
          id: "$customer",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
            },
          },
          {
            $project: {
              name: 1,
              city: 1,
              mobile: 1,
              isTransporter: 1,
              _id: 1,
            },
          },
        ],
        as: "customer",
      },
    },
    { $unwind: "$customer" },
    {
      $lookup: {
        from: "parties",
        let: {
          id: "$transporter",
        },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$id"] },
            },
          },
          {
            $project: {
              name: 1,
              city: 1,
              mobile: 1,
              isTransporter: 1,
              _id: 1,
            },
          },
        ],
        as: "transporter",
      },
    },
    {
      $unwind: {
        path: "$transporter",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "drivers",
        let: {
          id: "$driver",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
            },
          },
          {
            $project: {
              name: 1,
              mobile: 1,
              _id: 1,
            },
          },
        ],
        as: "driver",
      },
    },
    {
      $unwind: {
        path: "$driver",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "vehicles",
        let: {
          id: "$vehicle",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
            },
          },
          {
            $project: {
              vehicleNumber: 1,
              _id: 1,
            },
          },
        ],
        as: "vehicle",
      },
    },
    {
      $unwind: {
        path: "$vehicle",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "deliveries",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$order", "$$id"],
              },
            },
          },
          {
            $project: {
              loading: { structured_formatting: { main_text: 1 } },
              unloading: { structured_formatting: { main_text: 1 } },
              lrNo: 1,
              billQuantity: 1,
              unloadingQuantity: 1,
              status: 1,
            },
          },
        ],
        as: "deliveries",
      },
    },
  ];

  query = [...query, ...lookups];

  console.log(query);

  if (sort) {
    // maybe we want to sort by blog title or something
    query.push({ $sort: sort });
  }

  query.push(
    {
      $group: {
        _id: null,
        // get a count of every result that matches until now
        count: { $sum: 1 },
        // keep our results for the next operation
        results: { $push: "$$ROOT" },
      },
    },
    // and finally trim the results to within the range given by start/endRow
    {
      $project: {
        count: 1,
        rows: { $slice: ["$results", startRow, endRow] },
      },
    }
  );

  const orders = await Order.aggregate(query);
  res.json(orders);
});

// @route   PATCH api/order
// @desc    Create Order
// @access  Private
router.patch(
  "/",
  [auth, [check("orderNo", "Please enter Order No.").not().isEmpty()]],
  async (req, res) => {
    const updates = Object.keys(req.body);
    try {
      const order = await Order.findOne({
        _id: req.body._id,
      })
        .populate("customer")
        .populate("transporter")
        .populate("driver")
        .populate("vehicle");

      console.log(req.body);

      if (!order) {
        return res.status(404).send("No order to update");
      }

      updates.forEach((update) => (order[update] = req.body[update]));
      await order.save();

      res.send(order);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/orders/
// @desc    Get Orders with Duplicate Valid Number
// @access  Private

router.get("/validateDuplicateOrderNo/:id", auth, async (req, res) => {
  const { account, saleDate, orderNo } = JSON.parse(req.params.id);
  try {
    let timestamps = getFiscalYearTimestamps(saleDate);
    const query = {
      account: account,
      orderNo: orderNo,
      saleDate: {
        $gte: timestamps.current.start,
        $lte: timestamps.current.end,
      },
    };

    // console.log(query);
    const order = await Order.findOne(query);
    console.log(order);

    res.json(order);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

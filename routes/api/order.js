const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Order = require("../../models/Order");
const auth = require("../../middlleware/auth");
const createFilterAggPipeline = require("../../utils/getAggregationPipeline");
const getFiscalYearTimestamps = require("../../utils/getFiscalYear");

const router = express.Router();
const importdata = require("../../data/orders");

let lookups = [
  { $unwind: "$deliveries" },
  {
    $lookup: {
      from: "organisations",
      let: {
        id: {
          $toObjectId: "$deliveries.lr.organisation",
        },
        deliveries: "$deliveries",
      },

      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$id"] },
          },
        },
      ],
      as: "deliveries.lr.organisation",
    },
  },
  {
    $unwind: {
      path: "$deliveries.lr.organisation",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: "$_id",
      orderNo: { $first: "$orderNo" },
      saleDate: { $first: "$saleDate" },
      customer: { $first: "$customer" },
      vehicleNumber: { $first: "$vehicleNumber" },
      vehicle: { $first: "$vehicle" },
      driver: { $first: "$driver" },
      orderExpenses: { $first: "$orderExpenses" },
      saleType: { $first: "$saleType" },
      saleRate: { $first: "$saleRate" },
      minimumSaleGuarantee: { $first: "$minimumSaleGuarantee" },
      saleAdvance: { $first: "$saleAdvance" },
      purchaseType: { $first: "$purchaseType" },
      purchaseRate: { $first: "$purchaseRate" },
      minimumPurchaseGuarantee: { $first: "$minimumPurchaseGuarantee" },
      purchaseAdvance: { $first: "$purchaseAdvance" },
      transporter: { $first: "$transporter" },
      createdDate: { $first: "$createdDate" },
      account: { $first: "$account" },
      deliveries: { $push: "$deliveries" },
    },
  },
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
          $lookup: {
            from: "organisations",
            let: {
              id: "$organisation",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$id"],
                  },
                },
              },
            ],
            as: "organisation",
          },
        },
        {
          $unwind: {
            path: "$organisation",
            preserveNullAndEmptyArrays: true,
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
];

// @route   POST api/order/insertmany
// @desc    Create many Vehicles
// @access  Private

router.post("/insertmany", auth, async (req, res) => {
  try {
    importdata.map((i) => {
      i.deliveries.map((del) => {
        if (del.lr) {
          if (!del.lr.lrCharges) {
            console.log(i);
          }
        }
      });
    });
    addresses = await Order.insertMany(importdata);
    res.json(addresses);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

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

  query = [...query, ...lookups];

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

// @route   GET api/orders/:OrderID
// @desc    Get Orders by orderID created by user
///////////////////////////////// @access  Public

router.get("/id/:id", async (req, res) => {
  try {
    let matches = { _id: new mongoose.Types.ObjectId(req.params.id) };

    let query = [
      // filter the results by our accountId
      {
        $match: Object.assign(matches),
      },
    ];

    query = [...query, ...lookups];

    const orders = await Order.aggregate(query);

    if (!orders) {
      res
        .status(400)
        .json({ errors: [{ msg: "There are no orders by this user" }] });
    }

    // console.log(response[0]);
    res.json(orders[0]);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PATCH api/order
// @desc    Update Order
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

      if (!order) {
        return res.status(404).send("No order to update");
      }

      updates.forEach((update) => (order[update] = req.body[update]));
      await order.save();

      await order.populate("customer");
      await order.populate("transporter");
      await order.populate("driver");
      await order.populate("vehicle");

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
    const order = await Order.findOne(query);
    console.log(order);

    res.json(order);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

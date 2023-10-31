const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middlleware/auth");
const createFilterAggPipeline = require("../../utils/getAggregationPipeline");
const getFiscalYearTimestamps = require("../../utils/getFiscalYear");
const Order = require("../../models/Order");

const router = express.Router();

let lookups = [
  {
    $lookup: {
      from: "parties",
      let: {
        id: { $toObjectId: "$customer" },
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
      as: "customer",
    },
  },
  {
    $unwind: {
      path: "$customer",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $match: {
      "deliveries.lr": {
        $exists: true,
      },
    },
  },
  {
    $lookup: {
      from: "addresses",
      let: {
        id: { $toObjectId: "$deliveries.lr.consignor" },
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
      as: "deliveries.lr.consignor",
    },
  },
  {
    $unwind: {
      path: "$deliveries.lr.consignor",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "addresses",
      let: {
        id: { $toObjectId: "$deliveries.lr.consignee" },
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
      as: "deliveries.lr.consignee",
    },
  },
  {
    $unwind: {
      path: "$deliveries.lr.consignee",
      preserveNullAndEmptyArrays: true,
    },
  },

  {
    $lookup: {
      from: "organisations",
      let: {
        id: { $toObjectId: "$deliveries.lr.organisation" },
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
      as: "deliveries.lr.organisation",
    },
  },
  {
    $unwind: {
      path: "$deliveries.lr.organisation",
      preserveNullAndEmptyArrays: true,
    },
  },
];

// @route   POST api/lr
// @desc    Create Lr
// @access  Private
router.post(
  "/",
  [auth, [check("lrNo", "Please enter Lr No.").not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const order = await Order.findOne({
        _id: req.body.order,
      });

      // Get fields
      const updates = Object.keys(req.body);
      const lrFields = {};
      lrFields.createdBy = req.user.id;
      updates.forEach((update) => (lrFields[update] = req.body[update]));

      try {
        // Create
        order.deliveries = order.deliveries.map((delivery) => {
          if (delivery._id === req.body.delivery) {
            return {
              ...delivery,
              lr: lrFields,
            };
          } else {
            return delivery;
          }
        });
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

// @route   GET api/lrs/
// @desc    Get Lrs created by user
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
    { $unwind: "$deliveries" },
  ];

  if (filter.organisation) {
    console.log(filter.organisation);
    query.push({
      $match: {
        "deliveries.lr.organisation": { $in: filter.organisation.values },
      },
    });
  }

  query = [...query, ...lookups];

  // filter according to filterModel object
  if (filter.lrNo) {
    const lrNoQuery = createFilterAggPipeline({ lrNo: filter.lrNo });
    query.push(lrNoQuery[0]);
  }

  // console.log(query);

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

  const lrs = await Order.aggregate(query);
  res.json(lrs);
});

// @route   PATCH api/lr
// @desc    Update Lr
// @access  Private
router.patch(
  "/",
  [auth, [check("lrNo", "Please enter Lr No.").not().isEmpty()]],
  async (req, res) => {
    try {
      const order = await Order.findOne({
        _id: req.body.order,
      });

      order.deliveries = order.deliveries.map((delivery) => {
        if (delivery._id === req.body.delivery) {
          return {
            ...delivery,
            lr: req.body,
          };
        } else {
          return delivery;
        }
      });

      if (!order) {
        return res.status(404).send("No lr to update");
      }

      // updates.forEach((update) => (lr[update] = req.body[update]));
      await order.save();

      res.send(order);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/lrs/
// @desc    Get Lrs with Duplicate Valid Number
// @access  Private

router.get("/validateDuplicateLrNo/:id", auth, async (req, res) => {
  const { account, lrDate, lrNo, organisation } = JSON.parse(req.params.id);
  try {
    let timestamps = getFiscalYearTimestamps(lrDate);
    const query = {
      account: account,
      "deliveries.lr.lrNo": lrNo,
      "deliveries.lr.lrDate": {
        $gte: timestamps.current.start,
        $lte: timestamps.current.end,
      },
      "deliveries.lr.organisation": organisation,
    };

    console.log(query);

    const order = await Order.findOne(query);

    res.json(order);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

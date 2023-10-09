const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Lr = require("../../models/Lr");
const auth = require("../../middlleware/auth");
const createFilterAggPipeline = require("../../utils/getAggregationPipeline");
const getFiscalYearTimestamps = require("../../utils/getFiscalYear");

const router = express.Router();

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

      // Get fields
      const updates = Object.keys(req.body);
      const lrFields = {};
      lrFields.createdBy = req.user.id;
      updates.forEach((update) => (lrFields[update] = req.body[update]));

      try {
        // Create
        lr = new Lr(lrFields);
        await lr.save();
        res.send(lr);
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
    sort = { lrDate: -1, lrNo: -1 },
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
  if (filter.lrNo) {
    const lrNoQuery = createFilterAggPipeline({ lrNo: filter.lrNo });
    query.push(lrNoQuery[0]);
  }

  if (filter.organisation) {
    const organisationQuery = createFilterAggPipeline({
      organisation: filter.organisation,
    });
    query.push(organisationQuery[0]);
  }

  console.log(query);

  // if (filter.vehicleNumber) {
  //   const vehicleNumberQuery = createFilterAggPipeline({
  //     vehicleNumber: filter.vehicleNumber,
  //   });
  //   query.push(vehicleNumberQuery[0]);
  // }

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
        from: "addresses",
        let: {
          id: "$consignor",
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
        as: "consignor",
      },
    },
    {
      $unwind: {
        path: "$consignor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "addresses",
        let: {
          id: "$consignee",
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
        as: "consignee",
      },
    },
    {
      $unwind: {
        path: "$consignee",
        preserveNullAndEmptyArrays: true,
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
    {
      $lookup: {
        from: "deliveries",
        let: {
          id: "$delivery",
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
        as: "delivery",
      },
    },
    {
      $unwind: {
        path: "$delivery",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "orders",
        let: {
          id: "$order",
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
        ],
        as: "order",
      },
    },
    {
      $unwind: {
        path: "$order",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

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

  const lrs = await Lr.aggregate(query);
  res.json(lrs);
});

// @route   GET api/lrs/:LrID
// @desc    Get Lrs by lrID created by user
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
                  $eq: ["$lr", "$$id"],
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

    const lrs = await Lr.aggregate(query);

    if (!lrs) {
      res
        .status(400)
        .json({ errors: [{ msg: "There are no lrs by this user" }] });
    }

    // console.log(response[0]);
    res.json(lrs[0]);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PATCH api/lr
// @desc    Create Lr
// @access  Private
router.patch(
  "/",
  [auth, [check("lrNo", "Please enter Lr No.").not().isEmpty()]],
  async (req, res) => {
    const updates = Object.keys(req.body);
    try {
      const lr = await Lr.findOne({
        _id: req.body._id,
      })
        .populate("consignor")
        .populate("consignee")
        .populate("organisation")
        .populate("delivery")
        .populate("order");

      console.log(req.body);

      if (!lr) {
        return res.status(404).send("No lr to update");
      }

      updates.forEach((update) => (lr[update] = req.body[update]));
      await lr.save();

      res.send(lr);
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
  const { account, lrDate, lrNo } = JSON.parse(req.params.id);
  try {
    let timestamps = getFiscalYearTimestamps(lrDate);
    const query = {
      account: account,
      lrNo: lrNo,
      lrDate: {
        $gte: timestamps.current.start,
        $lte: timestamps.current.end,
      },
    };

    // console.log(query);
    const lr = await Lr.findOne(query);
    console.log(lr);

    res.json(lr);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

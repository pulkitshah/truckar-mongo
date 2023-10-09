const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Delivery = require("../../models/Delivery");
const auth = require("../../middlleware/auth");

const router = express.Router();

// @route   POST api/delivery
// @desc    Create Delivery
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get fields
    const updates = Object.keys(req.body);
    const deliveryFields = {};
    deliveryFields.createdBy = req.user.id;
    updates.forEach((update) => (deliveryFields[update] = req.body[update]));

    try {
      // Create
      delivery = new Delivery(deliveryFields);
      await delivery.save();
      res.send(delivery);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PATCH api/delivery
// @desc    Update Delivery
// @access  Private
router.patch("/", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const delivery = await Delivery.findOne({
      _id: req.body._id,
    }).populate("order");

    if (!delivery) {
      return res.status(404).send("No order to update");
    }

    updates.forEach((update) => (delivery[update] = req.body[update]));
    await delivery.save();

    res.send(delivery);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/delivery/deliveriesbyorder
// @desc    Get Deliveries created from account for an order
// @access  Private

router.get("/deliveriesbyorder/:id", auth, async (req, res) => {
  const { account, order } = JSON.parse(req.params.id);
  try {
    const query = {
      account,
      order,
    };
    const deliveries = await Delivery.find(query)
      .populate({
        path: "lr",
        populate: {
          path: "organisation",
          model: "organisation",
        },
      })
      .populate("order");

    console.log(query);
    res.json(deliveries);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

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
    sort = { orderNo: -1 },
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
  // if (filter.orderNo) {
  //   const orderNoQuery = createFilterAggPipeline({ orderNo: filter.orderNo });
  //   query.push(orderNoQuery[0]);
  // }

  // if (filter.customer) {
  //   const customerQuery = createFilterAggPipeline({
  //     customer: filter.customer,
  //   });
  //   query.push(customerQuery[0]);
  // }

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
          {
            $lookup: {
              from: "parties",
              let: {
                id: "$transporter",
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
                    loading: 1,
                    unloading: 1,
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
    {
      $lookup: {
        from: "lrs",
        let: {
          id: "$lr",
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
        ],
        as: "lr",
      },
    },
    {
      $unwind: {
        path: "$lr",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  query = [...query, ...lookups];

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

  const deliveries = await Delivery.aggregate(query);
  res.json(deliveries);
});
module.exports = router;

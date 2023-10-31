const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Delivery = require("../../models/Delivery");
const auth = require("../../middlleware/auth");

const router = express.Router();

const Order = require("../../models/Order");

let lookups = [
  // each blog has a single user (author) so flatten it using $unwind
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
            // isTransporter: 1,
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
            // isTransporter: 1,
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
  // {
  //   $lookup: {
  //     from: "invoices",
  //     let: {
  //       id: "$_id",
  //       delivery: { $toObjectId: "$deliveries._id" },
  //     },
  //     pipeline: [
  //       {
  //         $unwind: "$deliveries", // Unwind the nested array to access its elements individually
  //       },
  //       {
  //         $match: {
  //           $expr: {
  //             $eq: ["$deliveries._id", "$$id"],
  //           },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "organisations",
  //           let: {
  //             id: "$organisation",
  //           },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: {
  //                   $eq: ["$_id", "$$id"],
  //                 },
  //               },
  //             },
  //           ],
  //           as: "organisation",
  //         },
  //       },
  //       {
  //         $unwind: {
  //           path: "$organisation",
  //           preserveNullAndEmptyArrays: true,
  //         },
  //       },
  //     ],
  //     as: "invoices",
  //   },
  // },
  // { $unwind: "$invoices" },
];

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
    startRow = 0,
    endRow = 100,
    filter = {},
    sort = { saleDate: -1, orderNo: -1 },
  } = JSON.parse(req.params.id);

  let query = [];
  if (account)
    query.push(
      {
        $match: Object.assign({
          account: new mongoose.Types.ObjectId(account),
        }),
      },
      {
        $match: {
          "deliveries.0": {
            $exists: true,
          },
        },
      }
    );

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

  const deliveries = await Order.aggregate(query);
  res.json(deliveries);
});

// @route   GET api/deliveries/deliveriesbycustomer/:id
// @desc    Get Deliveries by a customer
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

router.get("/deliveriesbycustomer/:id", auth, async (req, res) => {
  const {
    account,
    customer,
    startRow,
    endRow,
    filter = {},
    sort = { saleDate: -1, orderNo: -1 },
  } = JSON.parse(req.params.id);

  console.log({
    account,
    customer,
    startRow,
    endRow,
    filter,
    sort,
  });

  let matches = {
    account: new mongoose.Types.ObjectId(account),
    customer: new mongoose.Types.ObjectId(customer),
  };

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

  const deliveries = await Order.aggregate(query);
  res.json(deliveries);
});

// @route   GET api/deliveries/:InvoiceID
// @desc    Get Deliveries by invoiceID created by user
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

    const deliveries = await Delivery.aggregate(query);

    if (!deliveries) {
      res
        .status(400)
        .json({ errors: [{ msg: "There are no deliveries by this user" }] });
    }

    // console.log(response[0]);
    res.json(deliveries[0]);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;

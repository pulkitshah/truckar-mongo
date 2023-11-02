const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Invoice = require("../../models/Invoice");
const auth = require("../../middlleware/auth");
const createFilterAggPipeline = require("../../utils/getAggregationPipeline");
const getFiscalYearTimestamps = require("../../utils/getFiscalYear");

const router = express.Router();
const importdata = require("../../data/invoices");

let lookups = [
  {
    $lookup: {
      from: "addresses",
      let: {
        id: "$billingAddress",
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
      as: "billingAddress",
    },
  },
  {
    $unwind: {
      path: "$billingAddress",
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
    $unwind: {
      path: "$deliveries",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "orders",
      let: {
        id: "$deliveries.order",
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
          $unwind: {
            path: "$deliveries",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "organisations",
            let: {
              id: {
                $toObjectId: "$deliveries.lr.organisation",
              },
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

        {
          $group: {
            _id: "$_id",
            orderNo: {
              $first: "$orderNo",
            },
            saleDate: {
              $first: "$saleDate",
            },
            createdDate: {
              $first: "$createdDate",
            },
            customer: {
              $first: "$customer",
            },
            vehicleNumber: {
              $first: "$vehicleNumber",
            },
            vehicle: {
              $first: "$vehicle",
            },
            driver: {
              $first: "$driver",
            },
            deliveries: { $push: "$deliveries" },
            orderExpenses: {
              $first: "$orderExpenses",
            },
            transporter: {
              $first: "$transporter",
            },
            saleType: {
              $first: "$saleType",
            },
            saleRate: {
              $first: "$saleRate",
            },
            minimumSaleGuarantee: {
              $first: "$minimumSaleGuarantee",
            },
            saleAdvance: {
              $first: "$saleAdvance",
            },
            purchaseType: {
              $first: "$purchaseType",
            },
            purchaseRate: {
              $first: "$purchaseRate",
            },
            minimumPurchaseGuarantee: {
              $first: "$minimumPurchaseGuarantee",
            },
            purchaseAdvance: {
              $first: "$purchaseAdvance",
            },
            account: {
              $first: "$account",
            },
          },
        },
      ],
      as: "deliveries.order",
    },
  },
  {
    $unwind: {
      path: "$deliveries.order",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: "$_id",
      invoiceFormat: {
        $first: "$invoiceFormat",
      },
      invoiceNo: {
        $first: "$invoiceNo",
      },
      invoiceDate: {
        $first: "$invoiceDate",
      },
      customer: {
        $first: "$customer",
      },
      organisation: {
        $first: "$organisation",
      },
      billingAddress: {
        $first: "$billingAddress",
      },
      deliveries: { $push: "$deliveries" },
      taxes: {
        $first: "$taxes",
      },
      account: {
        $first: "$account",
      },
    },
  },
];

// @route   POST api/order/insertmany
// @desc    Create many Vehicles
// @access  Private

router.post("/insertmany", auth, async (req, res) => {
  try {
    addresses = await Invoice.insertMany(importdata);
    res.json(addresses);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/invoice
// @desc    Create Invoice
// @access  Private
router.post(
  "/",
  [auth, [check("invoiceNo", "Please enter Invoice No.").not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get fields
      const updates = Object.keys(req.body);
      const invoiceFields = {};
      invoiceFields.createdBy = req.user.id;
      updates.forEach((update) => (invoiceFields[update] = req.body[update]));

      console.log(invoiceFields);

      invoiceFields.deliveries = invoiceFields.deliveries.map((delivery) => ({
        order: delivery.order,
        delivery: delivery.delivery,
        particular: delivery.particular,
        invoiceCharges: delivery.invoiceCharges,
      }));

      try {
        // Create
        invoice = new Invoice(invoiceFields);
        await invoice.save();
        res.send(invoice);
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

// @route   GET api/invoices/
// @desc    Get Invoices created by user
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
    sort = { invoiceDate: -1, invoiceNo: -1 },
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
  if (filter.invoiceNo) {
    const invoiceNoQuery = createFilterAggPipeline({
      invoiceNo: filter.invoiceNo,
    });
    query.push(invoiceNoQuery[0]);
  }

  if (filter.organisation) {
    const organisationQuery = createFilterAggPipeline({
      organisation: filter.organisation,
    });
    query.push(organisationQuery[0]);
  }

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

  const invoices = await Invoice.aggregate(query);
  res.json(invoices);
});

// @route   GET api/invoices/:InvoiceID
// @desc    Get Invoices by invoiceID created by user
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

    const invoices = await Invoice.aggregate(query);

    if (!invoices) {
      res
        .status(400)
        .json({ errors: [{ msg: "There are no invoices by this user" }] });
    }

    // console.log(response[0]);
    res.json(invoices[0]);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PATCH api/invoice
// @desc    Create Invoice
// @access  Private
router.patch(
  "/",
  [auth, [check("invoiceNo", "Please enter Invoice No.").not().isEmpty()]],
  async (req, res) => {
    const updates = Object.keys(req.body);
    try {
      const invoice = await Invoice.findOne({
        _id: req.body._id,
      })
        .populate("consignor")
        .populate("consignee")
        .populate("organisation")
        .populate("delivery")
        .populate("order");

      console.log(req.body);

      if (!invoice) {
        return res.status(404).send("No invoice to update");
      }

      updates.forEach((update) => (invoice[update] = req.body[update]));
      await invoice.save();

      res.send(invoice);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/invoices/
// @desc    Get Invoices with Duplicate Valid Number
// @access  Private

router.get("/validateDuplicateInvoiceNo/:id", auth, async (req, res) => {
  const { account, invoiceDate, invoiceNo, organisation } = JSON.parse(
    req.params.id
  );
  try {
    let timestamps = getFiscalYearTimestamps(invoiceDate);
    const query = {
      account: account,
      invoiceNo: invoiceNo,
      invoiceDate: {
        $gte: timestamps.current.start,
        $lte: timestamps.current.end,
      },
      organisation: organisation,
    };

    const invoice = await Invoice.findOne(query);
    console.log(invoice);

    res.json(invoice);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

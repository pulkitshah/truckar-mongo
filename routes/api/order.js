const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Order = require("../../models/Order");
const auth = require("../../middlleware/auth");

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

      //   if (req.body.orderNo) orderFields.orderNo = req.body.orderNo;
      //   if (req.body.saleDate) orderFields.saleDate = req.body.saleDate;
      //   if (req.body.createdDate) orderFields.createdDate = req.body.createdDate;
      //   if (req.body.customer) orderFields.customer = req.body.customer;
      //   if (req.body.deliveries) orderFields.deliveries = req.body.deliveries;
      //   if (req.body.vehicleNumber) orderFields.vehicleNumber = req.body.vehicleNumber;
      //   if (req.body.vehicle) orderFields.vehicle = req.body.vehicle;
      //   if (req.body.driver) orderFields.driver = req.body.driver;
      //   if (req.body.orderExpenses) orderFields.orderExpenses = req.body.orderExpenses;
      //   if (req.body.transporter) orderFields.transporter = req.body.transporter;
      //   if (req.body.saleType) orderFields.saleType = req.body.saleType;
      //   if (req.body.saleRate) orderFields.saleRate = req.body.saleRate;

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

router.get("/:id", auth, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  try {
    const orders = await Order.aggregate([
      {
        $match: { account: new mongoose.Types.ObjectId(req.params.id) },
      },
      { $sort: { saleDate: -1, createdDate: -1 } },
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
                transporter: 1,
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
                billWeight: 1,
                unloadingWeight: 1,
                status: 1,
              },
            },
          ],
          as: "deliveries",
        },
      },
    ]);
    res.json(orders);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/orders/
// @desc    Get Orders with Duplicate Valid Number
// @access  Private

router.get("/validateDuplicateOrderNo/:id", auth, async (req, res) => {
  const { account, saleDate, orderNo } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account.id,
      saleDate: saleDate,
    };
    if (orderNo) {
      query.orderNo = orderNo;
    }
    console.log(query);
    const order = await Order.findOne(query);
    res.json(order);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

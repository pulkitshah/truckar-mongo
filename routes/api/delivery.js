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

// @route   GET api/deliveries/
// @desc    Get Deliveries created from account that matches input
// @access  Private

router.get("/:id", auth, async (req, res) => {
  const { account, value } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account.id,
    };
    if (value) {
      query.name = { $regex: value, $options: "i" };
      // query.name = new RegExp(`.*${value}*.`, "i");
    }
    const deliveries = await Delivery.find(query);
    res.json(deliveries);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/deliveries/
// @desc    Get Deliveries with Duplicate Valid Number
// @access  Private

router.get("/validateDuplicateDeliveryNumber/:id", auth, async (req, res) => {
  const { account, deliveryNumber } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account.id,
    };
    if (deliveryNumber) {
      query.deliveryNumber = { $regex: `^${deliveryNumber}$`, $options: "i" };
    }
    console.log(query);
    const delivery = await Delivery.findOne(query);
    res.json(delivery);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

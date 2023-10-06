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

module.exports = router;

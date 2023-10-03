const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Vehicle = require("../../models/Vehicle");
const auth = require("../../middlleware/auth");

const router = express.Router();

// @route   POST api/vehicle
// @desc    Create Vehicle
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get fields
    const updates = Object.keys(req.body);
    const vehicleFields = {};
    vehicleFields.createdBy = req.user.id;
    updates.forEach((update) => (vehicleFields[update] = req.body[update]));

    try {
      // Create
      vehicle = new Vehicle(vehicleFields);
      await vehicle.save();
      res.send(vehicle);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/vehicles/
// @desc    Get Vehicles created from account that matches input
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
    const vehicles = await Vehicle.find(query);
    res.json(vehicles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/vehicles/
// @desc    Get Vehicles with Duplicate Valid Number
// @access  Private

router.get("/validateDuplicateVehicleNumber/:id", auth, async (req, res) => {
  const { account, vehicleNumber } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account.id,
    };
    if (vehicleNumber) {
      query.vehicleNumber = { $regex: `^${vehicleNumber}$`, $options: "i" };
    }
    console.log(query);
    const vehicle = await Vehicle.findOne(query);
    res.json(vehicle);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

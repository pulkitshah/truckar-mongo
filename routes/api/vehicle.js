const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Vehicle = require("../../models/Vehicle");
const auth = require("../../middlleware/auth");

const router = express.Router();
const importdata = require("../../data/done - vehicles");

// @route   POST api/vehicle/insertmany
// @desc    Create many Vehicles
// @access  Private

router.post("/insertmany", auth, async (req, res) => {
  try {
    addresses = await Vehicle.insertMany(importdata);
    res.json(importdata);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

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

// @route   GET api/vehicle/
// @desc    Get Vehicles created from account that matches input
// @access  Private

router.get("/:id", auth, async (req, res) => {
  const { account, value } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account,
    };
    if (value) {
      query.name = { $regex: value, $options: "i" };
      // query.name = new RegExp(`.*${value}*.`, "i");
    }
    const vehicles = await Vehicle.find(query).populate("organisation");
    res.json(vehicles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/vehicle/
// @desc    Get Vehicles with Duplicate Valid Number
// @access  Private

router.get("/validateDuplicateVehicleNumber/:id", auth, async (req, res) => {
  const { account, vehicleNumber } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account,
    };
    if (vehicleNumber) {
      query.vehicleNumber = { $regex: `^${vehicleNumber}$`, $options: "i" };
    }

    const vehicle = await Vehicle.findOne(query);
    res.json(vehicle);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PATCH api/vehicle/
// @desc    Update Vehicle
// @access  Private
router.patch("/", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const vehicle = await Vehicle.findOne({
      _id: req.body._id,
    });

    updates.forEach((update) => (vehicle[update] = req.body[update]));

    await vehicle.save();

    res.send(vehicle);
  } catch (error) {
    console.log(error);
    // res.status(400).send(error);
  }
});

module.exports = router;

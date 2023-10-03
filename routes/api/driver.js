const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Driver = require("../../models/Driver");
const auth = require("../../middlleware/auth");

const router = express.Router();

// @route   POST api/driver
// @desc    Create Driver
// @access  Privates
router.post("/", auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get fields
    const updates = Object.keys(req.body);
    const driverFields = {};
    driverFields.createdBy = req.user.id;
    updates.forEach((update) => (driverFields[update] = req.body[update]));

    try {
      // Create
      driver = new Driver(driverFields);
      await driver.save();
      res.send(driver);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/drivers/
// @desc    Get Drivers created from account that matches input
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
    const drivers = await Driver.find(query);
    res.json(drivers);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/drivers/validateDuplicateName
// @desc    Get Drivers with Duplicate Valid Name
// @access  Private

router.get("/validateDuplicateName/:id", auth, async (req, res) => {
  const { account, name } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account.id,
    };
    if (name) {
      query.name = { $regex: `^${name}$`, $options: "i" };
    }
    console.log(query);
    const driver = await Driver.findOne(query);
    res.json(driver);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/drivers/validateDuplicateMobile
// @desc    Get Drivers with Duplicate Valid Mobile Number
// @access  Private

router.get("/validateDuplicateMobile/:id", auth, async (req, res) => {
  const { account, mobile } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account.id,
    };
    if (mobile) {
      query.mobile = mobile;
    }
    const driver = await Driver.findOne(query);
    res.json(driver);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

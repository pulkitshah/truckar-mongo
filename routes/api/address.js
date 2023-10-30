const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Address = require("../../models/Address");
const auth = require("../../middlleware/auth");

const router = express.Router();

const importdata = require("../../data/done- addresses");

// @route   POST api/address/insertmany
// @desc    Create many parties
// @access  Private

router.post("/insertmany", auth, async (req, res) => {
  try {
    addresses = await Address.insertMany(importdata);
    res.json(importdata);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/address
// @desc    Create Address
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get fields
    const updates = Object.keys(req.body);
    const addressFields = {};
    addressFields.createdBy = req.user.id;
    updates.forEach((update) => (addressFields[update] = req.body[update]));

    try {
      // Create
      address = new Address(addressFields);
      await address.save();
      await address.populate("party");
      res.send(address);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/parties/
// @desc    Get Parties created from account that matches input
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
    const parties = await Address.find(query).populate("party");

    res.json(parties);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/parties/
// @desc    Get Parties with Duplicate Valid Number
// @access  Private

router.get("/validateDuplicateMobile/:id", auth, async (req, res) => {
  const { account, value } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account,
    };
    if (value) {
      query.mobile = value;
    }

    const address = await Address.findOne(query);
    res.json(address);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/parties/
// @desc    Get Parties with Duplicate Valid Number
// @access  Private

router.get("/validateDuplicateName/:id", auth, async (req, res) => {
  const { account, value } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account,
    };
    if (value) {
      query.name = { $regex: `^${value}$`, $options: "i" };
    }
    const address = await Address.findOne(query);
    res.json(address);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PATCH api/address/
// @desc    Update Address
// @access  Private
router.patch("/", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const address = await Address.findOne({
      _id: req.body._id,
    });

    updates.forEach((update) => (address[update] = req.body[update]));

    await address.save();
    await address.populate("party");

    res.send(address);
  } catch (error) {
    console.log(error);
    // res.status(400).send(error);
  }
});

module.exports = router;

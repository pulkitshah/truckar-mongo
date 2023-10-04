const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Party = require("../../models/Party");
const auth = require("../../middlleware/auth");

const router = express.Router();

// @route   POST api/party
// @desc    Create Party
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get fields
    const updates = Object.keys(req.body);
    const partyFields = {};
    partyFields.createdBy = req.user.id;
    updates.forEach((update) => (partyFields[update] = req.body[update]));

    //   if (req.body.partyNo) partyFields.partyNo = req.body.partyNo;
    //   if (req.body.saleDate) partyFields.saleDate = req.body.saleDate;
    //   if (req.body.createdDate) partyFields.createdDate = req.body.createdDate;
    //   if (req.body.customer) partyFields.customer = req.body.customer;
    //   if (req.body.deliveries) partyFields.deliveries = req.body.deliveries;
    //   if (req.body.vehicleNumber) partyFields.vehicleNumber = req.body.vehicleNumber;
    //   if (req.body.vehicle) partyFields.vehicle = req.body.vehicle;
    //   if (req.body.driver) partyFields.driver = req.body.driver;
    //   if (req.body.partyExpenses) partyFields.partyExpenses = req.body.partyExpenses;
    //   if (req.body.transporter) partyFields.transporter = req.body.transporter;
    //   if (req.body.saleType) partyFields.saleType = req.body.saleType;
    //   if (req.body.saleRate) partyFields.saleRate = req.body.saleRate;

    try {
      // Create
      party = new Party(partyFields);
      await party.save();
      res.send(party);
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
    const parties = await Party.find(query);
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
  const { account, mobile } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account.id,
    };
    if (mobile) {
      query.mobile = mobile;
    }
    const party = await Party.findOne(query);
    res.json(party);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/parties/
// @desc    Get Parties with Duplicate Valid Number
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
    const party = await Party.findOne(query);
    res.json(party);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Party = require("../../models/Party");
const auth = require("../../middlleware/auth");

const importdata = require("../../data/done- party");

const router = express.Router();

// @route   POST api/party/insertmany
// @desc    Create many parties
// @access  Private

router.post("/insertmany", auth, async (req, res) => {
  try {
    parties = await Party.insertMany(importdata);
    res.json(importdata);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

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
  const { account, value } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account,
    };
    if (value) {
      query.mobile = value;
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
  const { account, value } = JSON.parse(req.params.id);
  try {
    const query = {
      account: account,
    };
    if (value) {
      query.name = { $regex: `^${value}$`, $options: "i" };
    }
    const party = await Party.findOne(query);
    res.json(party);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PATCH api/party/
// @desc    Update Party
// @access  Private
router.patch("/", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const party = await Party.findOne({
      _id: req.body._id,
    });

    updates.forEach((update) => (party[update] = req.body[update]));

    await party.save();

    res.send(party);
  } catch (error) {
    console.log(error);
    // res.status(400).send(error);
  }
});

module.exports = router;

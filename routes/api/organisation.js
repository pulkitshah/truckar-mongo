const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const Organisation = require("../../models/Organisation");
const auth = require("../../middlleware/auth");

const router = express.Router();

// @route   POST api/organisation
// @desc    Create Organisation
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get fields
    const updates = Object.keys(req.body);
    const organisationFields = {};
    organisationFields.createdBy = req.user.id;
    updates.forEach(
      (update) => (organisationFields[update] = req.body[update])
    );

    try {
      // Create
      organisation = new Organisation(organisationFields);
      await organisation.save();
      res.send(organisation);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/organisation/
// @desc    Get Organisations created from account that matches input
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
    const organisations = await Organisation.find(query);
    res.json(organisations);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/organisation/
// @desc    Get Organisations with Duplicate Valid Number
// @access  Private

router.get(
  "/validateDuplicateOrganisationNumber/:id",
  auth,
  async (req, res) => {
    const { account, organisationNumber } = JSON.parse(req.params.id);
    try {
      const query = {
        account: account,
      };
      if (organisationNumber) {
        query.organisationNumber = {
          $regex: `^${organisationNumber}$`,
          $options: "i",
        };
      }
      console.log(query);
      const organisation = await Organisation.findOne(query);
      res.json(organisation);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   PATCH api/organisation/
// @desc    Update Organisation
// @access  Private
router.patch("/", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const organisation = await Organisation.findOne({
      _id: req.body._id,
    });

    updates.forEach((update) => (organisation[update] = req.body[update]));

    await organisation.save();

    res.send(organisation);
  } catch (error) {
    console.log(error);
    // res.status(400).send(error);
  }
});

module.exports = router;

const express = require("express");
const { check, validationResult } = require("express-validator/check");
const Party = require("../../models/Party");
const Order = require("../../models/Order");
const PartyAddress = require("../../models/PartyAddress");
const auth = require("../../middlleware/auth");
const { getWhatsappId } = require("../../utils/whatsapp");

const router = express.Router();

// @route   GET api/parties/
// @desc    Get Parties created by user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const party = await Party.find({
      user: req.user.id,
    });

    if (!party) {
      res
        .status(400)
        .json({ errors: [{ msg: "There are no parties by this user" }] });
    }

    res.json(party);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/parties/addresses/
// @desc    Get Addresses created by user
// @access  Private
router.get("/addresses/", auth, async (req, res) => {
  try {
    let partyAddresses = await PartyAddress.find({
      user: req.user.id,
    });

    if (!partyAddresses) {
      res.status(400).json({
        errors: [
          { msg: "There are no addresses saved for any party by this user" },
        ],
      });
    }

    res.json(partyAddresses);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/parties/addresses/
// @desc    Get Addresses of a party created by user
// @access  Private
router.get("/addresses/:partyId", async (req, res) => {
  try {
    let partyAddresses = await PartyAddress.find({
      party: req.params.partyId,
    });

    if (!partyAddresses) {
      res.status(400).json({
        errors: [
          { msg: "There are no addresses saved for any party by this user" },
        ],
      });
    }

    res.json(partyAddresses);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/parties/transporters
// @desc    Get Transporter Parties created by user
// @access  Private
router.get("/transporters", auth, async (req, res) => {
  try {
    const party = await Party.find({
      user: req.user.id,
      transporter: true,
    });

    if (!party) {
      res
        .status(400)
        .json({ errors: [{ msg: "There are no parties by this user" }] });
    }

    res.json(party);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/parties/:id
// @desc    Get Parties by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    party = await Party.findOne({ _id, user: req.user.id });
    if (!party) {
      return res.status(400).send("No party by that id");
    }
    await party.populate("user").execPopulate();
    res.send(party);
  } catch (error) {
    console.log(error);
    res.status(400).send("Recheck Id");
  }
});

// @route   PATCH api/parties/:ID
// @desc    Edit Parties created by user
// @access  Private
router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const party = await Party.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!party) {
      return res.status(404).send("No party to update");
    }

    updates.forEach((update) => (party[update] = req.body[update]));
    if (req.body.mobile) {
      // Check Whatsapp Status
      const contact = await getWhatsappId(req.body.mobile);
      console.log(contact);
      party.waId = contact.wa_id;
    }
    await party.save();

    // party = await Party.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true})
    // console.log(user)

    res.send(party);
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
});

// @route   PATCH api/parties/addresses/:ID
// @desc    Edit Party Addresses created by user
// @access  Private
router.patch("/addresses/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const partyAddress = await PartyAddress.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!partyAddress) {
      return res.status(404).send("No party to update");
    }

    updates.forEach((update) => (partyAddress[update] = req.body[update]));
    await partyAddress.save();

    // party = await Party.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true})
    // console.log(user)

    res.send(partyAddress);
  } catch (error) {
    res.status(400).send(error);
  }
});
// @route   POST api/parties/
// @desc    Create party
// @access  Private
router.post(
  "/",
  [auth, [check("name", "Please enter Party Name.").not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Get fields
      const updates = Object.keys(req.body);

      const partyFields = {};
      partyFields.user = req.user.id;
      updates.forEach((update) => (partyFields[update] = req.body[update]));
      partyFields.transporter = Boolean(req.body.transporter);
      if (req.body.mobile) {
        // Check Whatsapp Status
        const contact = await getWhatsappId(req.body.mobile);
        // console.log(contact);
        // partyFields.waId = contact.wa_id;
      }
      // console.log(req.user.id);
      try {
        // let party = await Party.findOne({ user: req.user.id });
        // // console.log(party);

        // if (party) {
        //   party = await Party.findOneAndUpdate(
        //     { user: req.user.id },
        //     { $set: partyFields },
        //     { new: true }
        //   );
        //   return res.json(party);
        // }
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
  }
);

// @route   POST api/parties/addresses/:partyid
// @desc    Create party address using party id
// @access  Private
router.post(
  "/addresses/:partyId",
  [[check("name", "Please enter Party Name.").not().isEmpty()]],
  async (req, res) => {
    try {
      party = await Party.findOne({ _id: req.params.partyId });
      if (!party) {
        return res.status(400).send("No party by that id");
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Get fields
      const partyAddressFields = {};
      partyAddressFields.user = party.user;
      partyAddressFields.party = req.params.partyId;

      if (req.body.name) partyAddressFields.name = req.body.name;
      if (req.body.gstin) partyAddressFields.gstin = req.body.gstin;
      if (req.body.pan) partyAddressFields.pan = req.body.pan;
      if (req.body.billingAddressLine1)
        partyAddressFields.billingAddressLine1 = req.body.billingAddressLine1;
      if (req.body.billingAddressLine2)
        partyAddressFields.billingAddressLine2 = req.body.billingAddressLine2;
      if (req.body.city) partyAddressFields.city = req.body.city;

      try {
        partyAddress = new PartyAddress(partyAddressFields);

        await partyAddress.save();
        res.send(partyAddress);
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

module.exports = router;

const express = require('express');
const { check, validationResult } = require('express-validator/check');

const Organisation = require('../../models/Organisation');
const auth = require('../../middlleware/auth');

const router = express.Router();

// @route   GET api/organisations/
// @desc    Get Organisations created by user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const organisation = await Organisation.find({
      user: req.user.id,
    });

    if (!organisation) {
      res
        .status(400)
        .json({ errors: [{ msg: 'There are no organisations by this user' }] });
    }

    res.json(organisation);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

//Get organisation by organisation id
router.get('/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    organisation = await Organisation.findOne({ _id, user: req.user.id });
    if (!organisation) {
      return res.status(400).send('No organisation by that id');
    }
    await organisation.populate('user').execPopulate();
    res.send(organisation);
  } catch (error) {
    console.log(error);
    res.status(400).send('Recheck Id');
  }
});

// @route   PATCH api/organisations/counter/orgId
// @desc    Get Organisations created by user
// @access  Private
router.patch('/counter/:orgId', auth, async (req, res) => {
  try {
    const organisation = await Organisation.findOne({
      _id: req.params.orgId,
      user: req.user.id,
    });

    if (!organisation) {
      return res.status(404).send('No organisation to update');
    }

    if (organisation.counter.length > 0) {
      let matches = false;
      organisation.counter = organisation.counter.map((counter) => {
        if (
          counter.counterType === req.body.counterType &&
          counter.fiscalYear === req.body.fiscalYear
        ) {
          matches = true;
          return req.body;
        }
        return counter;
      });
      if (!matches) {
        organisation.counter = [...organisation.counter, req.body];
      }
    } else {
      organisation.counter = [req.body];
    }
    organisation.markModified('counter');

    await organisation.save();
    res.send(organisation);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// @route   GET api/organisations/me
// @desc    Get Organisations created by user
// @access  Private

router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const organisation = await Organisation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!organisation) {
      return res.status(404).send('No organisation to update');
    }

    console.log(updates);

    updates.forEach((update) => (organisation[update] = req.body[update]));
    await organisation.save();

    // organisation = await Organisation.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true})
    // console.log(user)

    res.send(organisation);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   POST api/organisations/me
// @desc    Create organisation
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Please enter Organisation Name.').not().isEmpty(),
      check('jurisdiction', 'Please enter Area of Jurisdiction')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Get fields
      const organisationFields = {};
      organisationFields.user = req.user.id;
      if (req.body.name) organisationFields.name = req.body.name;
      if (req.body.pan) organisationFields.pan = req.body.pan;
      if (req.body.gstin) organisationFields.gstin = req.body.gstin;
      if (req.body.addressLine1)
        organisationFields.addressLine1 = req.body.addressLine1;
      if (req.body.addressLine2)
        organisationFields.addressLine2 = req.body.addressLine2;
      if (req.body.initials) organisationFields.initials = req.body.initials;

      if (req.body.jurisdiction)
        organisationFields.jurisdiction = req.body.jurisdiction;

      // console.log(req.user.id);
      try {
        // let organisation = await Organisation.findOne({ user: req.user.id });
        // // console.log(organisation);

        // if (organisation) {
        //   organisation = await Organisation.findOneAndUpdate(
        //     { user: req.user.id },
        //     { $set: organisationFields },
        //     { new: true }
        //   );
        //   return res.json(organisation);
        // }
        // Create
        organisation = new Organisation(organisationFields);

        await organisation.save();
        res.send(organisation);
      } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;

const express = require('express');
const { check, validationResult } = require('express-validator/check');

const Tax = require('../../models/Tax');
const auth = require('../../middlleware/auth');

const router = express.Router();

// @route   GET api/taxes/
// @desc    Get Taxes created by user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tax = await Tax.find({
      user: req.user.id,
    });

    if (!tax) {
      res
        .status(400)
        .json({ errors: [{ msg: 'There are no taxes by this user' }] });
    }

    res.json(tax);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

//Get tax by tax id
router.get('/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    tax = await Tax.findOne({ _id, user: req.user.id });
    if (!tax) {
      return res.status(400).send('No tax by that id');
    }
    await tax.populate('user').execPopulate();
    res.send(tax);
  } catch (error) {
    console.log(error);
    res.status(400).send('Recheck Id');
  }
});

router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const tax = await Tax.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!tax) {
      return res.status(404).send('No tax to update');
    }

    console.log(updates);

    updates.forEach((update) => (tax[update] = req.body[update]));
    await tax.save();

    // tax = await Tax.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true})
    // console.log(user)

    res.send(tax);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   POST api/taxes/
// @desc    Create tax
// @access  Private
router.post(
  '/',
  [auth, [check('name', 'Please enter Tax Name.').not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      console.log(req.body.default);
      // Get fields
      const taxFields = {};
      taxFields.user = req.user.id;
      if (req.body.name) taxFields.name = req.body.name;
      if (req.body.value) taxFields.value = req.body.value;
      // console.log(req.user.id);
      try {
        // Create
        tax = new Tax(taxFields);

        await tax.save();
        res.send(tax);
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

// // @route   GET api/taxes
// // @desc    Get all taxes
// // @access  Public
// router.get('/', async (req, res) => {
//   try {
//     const taxes = await Tax.find().populate('user', ['name']);
//     if (!taxes.length > 0) {
//       return res
//         .status(400)
//         .json({ errors: [{ msg: 'There are no taxes.' }] });
//     }

//     res.json(taxes);
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send('Server Error');
//   }
// });

module.exports = router;

const express = require('express');
const { check, validationResult } = require('express-validator/check');

const Branch = require('../../models/Branch');
const auth = require('../../middlleware/auth');
const User = require('../../models/User');

const router = express.Router();

// @route   GET api/branches/
// @desc    Get Branches created by user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const branch = await Branch.find({
      user: req.user.id,
    });

    if (!branch) {
      res
        .status(400)
        .json({ errors: [{ msg: 'There are no branches by this user' }] });
    }

    res.json(branch);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/branches/defaults
// @desc    Get Branches created by user
// @access  Private
router.get('/defaults', auth, async (req, res) => {
  try {
    const branch = await Branch.find({
      user: req.user.id,
      default: true,
    }).sort({ _id: 1 });

    if (!branch) {
      res
        .status(400)
        .json({ errors: [{ msg: 'There are no branches by this user' }] });
    }

    res.json(branch);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/branches/:id
// @desc    Get Branches by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    branch = await Branch.findOne({ _id, user: req.user.id });
    if (!branch) {
      return res.status(400).send('No branch by that id');
    }
    await branch.populate('user').execPopulate();
    res.send(branch);
  } catch (error) {
    console.log(error);
    res.status(400).send('Recheck Id');
  }
});

// @route   PATCH api/branches/:id
// @desc    PATCH Branches by ID
// @access  Private
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const branch = await Branch.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!branch) {
      return res.status(404).send('No branch to update');
    }

    console.log(updates);

    updates.forEach((update) => (branch[update] = req.body[update]));
    await branch.save();

    // branch = await Branch.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true})
    // console.log(user)

    res.send(branch);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   POST api/branches/
// @desc    Create branch
// @access  Private
router.post(
  '/',
  [auth, [check('name', 'Please enter Branch Name.').not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Create Branch Fields
      const branchFields = {};
      branchFields.user = req.user.id;
      if (req.body.name) branchFields.name = req.body.name;
      if (req.body.addressLine1)
        branchFields.addressLine1 = req.body.addressLine1;
      if (req.body.addressLine2)
        branchFields.addressLine2 = req.body.addressLine2;
      if (req.body.city) branchFields.city = req.body.city;

      // Update Branch for the creator user
      const user = await User.findOne({
        _id: req.user.id,
      });

      if (!user) {
        return res.status(404).send('No User to update');
      }

      try {
        branch = new Branch(branchFields);
        await branch.save();

        // Update Branch details for user in Users Collection
        if (user.branchIds.length) {
          user.branchIds = [...user.branchIds, branch._id];
        } else {
          user.branchIds = [branch._id];
          user.defaultBranch = branch._id;
        }
        await user.save();

        res.send(branch);
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

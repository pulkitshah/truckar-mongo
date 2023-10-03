const express = require('express');
const { check, validationResult } = require('express-validator/check');

const UserSetting = require('../../models/UserSettings');
const auth = require('../../middlleware/auth');

const router = express.Router();

// @route   POST api/userSettings/
// @desc    Create userSetting
// @access  Private
router.post('/', [auth, []], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Get fields
    const userSettingFields = {};
    userSettingFields.user = req.user.id;
    if (req.body.lr) userSettingFields.lr = req.body.lr;

    try {
      // Create UserSetting
      userSetting = new UserSetting(userSettingFields);

      await userSetting.save();

      res.send(userSetting);
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

//Get userSetting by userSetting id
router.get('/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    userSetting = await UserSetting.findOne({ _id, user: req.user.id });
    if (!userSetting) {
      return res.status(400).send('No userSetting by that id');
    }
    await userSetting.populate('organisation').execPopulate();
    res.send(userSetting);
  } catch (error) {
    console.log(error);
    res.status(400).send('Recheck Id');
  }
});

//Update userSetting by userSetting id
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const userSetting = await UserSetting.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!userSetting) {
      return res.status(404).send('No userSetting to update');
    }

    console.log(updates);

    updates.forEach((update) => (userSetting[update] = req.body[update]));
    await userSetting.save();

    // userSetting = await UserSetting.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true})
    // console.log(user)

    res.send(userSetting);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   GET api/userSettings
// @desc    Get all userSettings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const userSettings = await UserSetting.find().populate('organisation', [
      'name',
    ]);

    if (!userSettings.length > 0) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'There are no userSettings.' }] });
    }

    res.json(userSettings);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/userSettings/owned
// @desc    Check if UserSetting is owned by the user
// @access  Private
router.post(
  '/owned',
  [
    auth,
    [
      check('userSettingNumber', 'Please enter UserSetting Number.')
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
      const userSettingFields = {};
      userSettingFields.user = req.user.id;
      if (req.body.userSettingNumber)
        userSettingFields.userSettingNumber = req.body.userSettingNumber;
      try {
        // Create UserSetting
        userSetting = await UserSetting.findOne({
          user: req.user.id,
          userSettingNumber: userSettingFields.userSettingNumber,
        });

        if (userSetting) {
          console.log(userSetting);
          res.send(userSetting);
        } else {
          res.status(204).send('Not Owned');
        }
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

const express = require('express');
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const config = require('config');

const auth = require('../../middlleware/auth');
const User = require('../../models/User');
const Prospect = require('../../models/Prospect');
const {
  getWhatsappId,
  sendProspectRegisterationWhatsappMessage,
} = require('../../utils/whatsapp');

const router = express.Router();

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.subuser).select('-password');
    let allUsers = await User.find({ createdBy: user.createdBy });
    let { marketName, accountType, defaultCharges } = allUsers.find((user) => {
      return user._id.toString() === user.createdBy.toString();
    });
    user.accountType = accountType;
    user.marketName = marketName;
    user.defaultCharges = defaultCharges;

    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/auth/subusers
// @desc    Get all users created by SuperUser
// @access  Private
router.get('/subusers', auth, async (req, res) => {
  console.log(req.user);
  try {
    const user = await User.find({ createdBy: req.user.id }).select(
      '-password'
    );
    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/auth/:userId
// @desc    Test route
// @access  Public
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/auth/
// @desc    Get all users created by SuperUser
// @access  Private
router.patch('/', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  // console.log(req.user);
  try {
    const user = await User.findOne({
      _id: req.user.subuser,
    });

    updates.forEach((update) => (user[update] = req.body[update]));

    if (req.body.password) {
      // Encrypt Password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    if (req.body.mobile) {
      // Check Whatsapp Status
      const contact = await getWhatsappId(req.body.mobile);
      user.waId = contact.wa_id;
    }
    await user.save();

    res.send(user);
  } catch (error) {
    console.log(error);
    // res.status(400).send(error);
  }
});

// @route   PATCH api/auth/subusers
// @desc    Get all users created by SuperUser
// @access  Private
router.patch('/subuser/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const subuser = await User.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!subuser) {
      return res.status(404).send('No subuser to update');
    }

    updates.forEach((update) => (subuser[update] = req.body[update]));

    if (req.body.password) {
      // Encrypt Password
      const salt = await bcrypt.genSalt(10);
      subuser.password = await bcrypt.hash(req.body.password, salt);
    }
    await subuser.save();

    // branch = await Branch.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true})
    // console.log(subuser);

    res.send(subuser);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// @route   POST api/auth/registersubuser
// @desc    Register SubUser for a user
// @access  Private
router.post(
  '/registersubuser',
  auth,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with min 6 characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log(req.user);
    const { name, email, password, mobile, branchIds } = req.body;
    const createdBy = req.user.id;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists by that email' }] });
      }

      user = await User.findOne({ mobile });
      if (user) {
        return res.status(400).json({
          errors: [{ msg: 'User already exists by that mobile number' }],
        });
      }

      user = new User({
        name,
        email,
        mobile,
        password,
        createdBy,
        branchIds,
      });

      // Encrypt Password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      if (req.body.mobile) {
        // Check Whatsapp Status
        const contact = await getWhatsappId(req.body.mobile);
        user.waId = contact.wa_id;
      }
      await user.save();

      res.json({ user });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/users
// @desc    Register SuperUser
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with min 6 characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, mobile } = req.body;
    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists by that email' }] });
      }

      //   user = await User.findOne({ mobile });
      //   if (user) {
      //     return res.status(400).json({
      //       errors: [{ msg: 'User already exists by that mobile number' }],
      //     });
      //   }

      user = new User({
        name,
        email,
        mobile,
        password,
      });

      user.createdBy = user._id;
      console.log(user);
      // Encrypt Password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return JSON Webtoken

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.NODE_ENV !== 'production'
          ? process.env.mongoURI_DEV.toString()
          : // : process.env.mongoURI_STAG.toString(),
            process.env.mongoURI_PROD.toString(),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/auth
// @desc    Sign In Users
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter password').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User does not exist.' }] });
      }

      let allUsers = await User.find({ createdBy: user.createdBy });
      let waIds = allUsers.map((user) => {
        return user.waId;
      });
      //Remove empty elements
      waIds = waIds.filter(function (el) {
        return el != null;
      });
      let {
        marketName,
        mobile,
        accountType,
        defaultCharges,
        extraDeliveryCharge,
      } = allUsers.find((user) => {
        return user._id.toString() === user.createdBy.toString();
      });
      // Check Password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Wrong Password' }] });
      }

      user.accountType = accountType;

      // Return JSON Webtoken
      const payload = {
        user: {
          id: user.createdBy,
          waIds: waIds,
          defaultBranch: user.defaultBranch,
          subuser: user.id,
          branchIds: user.branchIds,
          marketName: marketName,
          mobile: mobile,
          accountType,
          defaultCharges,
          extraDeliveryCharge,
        },
      };

      console.log(payload);
      jwt.sign(
        payload,
        process.env.NODE_ENV !== 'production'
          ? process.env.jwtSecret_DEV.toString()
          : process.env.jwtSecret_PROD.toString(),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ accessToken: token, user });
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/users
// @desc    Register for subscription
// @access  Public
router.post(
  '/registerforsubscription',
  // [check('name', 'First Name is required').not().isEmpty()],
  async (req, res) => {
    console.log(req.body);
    const { name, mobile, location } = req.body;
    try {
      prospect = new Prospect({
        name,
        mobile,
        location,
      });

      if (req.body.mobile) {
        // Check Whatsapp Status
        const contact = await getWhatsappId(req.body.mobile);
        prospect.waId = contact.wa_id;
      }

      await sendProspectRegisterationWhatsappMessage(prospect);

      await prospect.save();
      // Return JSON Webtoken
      res.send(prospect);
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;

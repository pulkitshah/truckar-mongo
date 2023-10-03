const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const auth = require("../../middlleware/auth");
const User = require("../../models/User");

const router = express.Router();

// @route   POST api/users
// @desc    Register User
// @access  Public
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a password with min 6 characters").isLength(
      { min: 6 }
    ),
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
          .json({ errors: [{ msg: "User already exists by that email" }] });
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
        onBoardingRequired: true,
      });

      user.createdBy = user._id;
      console.log(user.toJSON());
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
        process.env.NODE_ENV !== "production"
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
      res.status(500).send("Server Error");
    }
  }
);

// @route   POST api/auth
// @desc    Sign In Users
// @access  Public
router.post(
  "/",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter password").exists(),
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
          .json({ errors: [{ msg: "User does not exist." }] });
      }

      // Check Password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: "Wrong Password" }] });
      }

      // Return JSON Webtoken
      const payload = {
        user,
      };

      jwt.sign(
        payload,
        process.env.NODE_ENV !== "production"
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
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/auth
// @desc    Get User from Token
// @access  Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PATCH api/auth/
// @desc    Update User
// @access  Private
router.patch("/", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const user = await User.findOne({
      _id: req.user.id,
    });

    updates.forEach((update) => (user[update] = req.body[update]));

    if (req.body.password) {
      // Encrypt Password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();

    res.send(user);
  } catch (error) {
    console.log(error);
    // res.status(400).send(error);
  }
});

module.exports = router;

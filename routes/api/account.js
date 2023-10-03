const express = require("express");
const { check, validationResult } = require("express-validator/check");
const Account = require("../../models/Account");
const User = require("../../models/User");
const auth = require("../../middlleware/auth");

const router = express.Router();

// @route   GET api/account/{id}
// @desc    Get Accounts with user
// @access  Private

router.get("/:id", auth, async (req, res) => {
  try {
    let accounts = [];

    const user = await User.findOne({
      _id: req.params.id,
    });

    await Promise.all(
      user.accounts.map(async (account) => {
        let acc = await Account.findOne({
          _id: account.account,
        });

        accounts.push(acc);
      })
    );

    res.json(accounts);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/account
// @desc    Create Account
// @access  Private
router.post(
  "/",
  [auth, [check("name", "Please enter Account Name.").not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get fields
      const accountFields = {};
      accountFields.user = req.user.id;

      if (req.body.name) accountFields.name = req.body.name;
      if (req.body.orderExpensesSettings)
        accountFields.orderExpensesSettings = req.body.orderExpensesSettings;
      if (req.body.lrSettings) accountFields.lrSettings = req.body.lrSettings;
      if (req.body.taxOptions) accountFields.taxOptions = req.body.taxOptions;
      if (req.body.lrFormat) accountFields.lrFormat = req.body.lrFormat;
      if (req.body.invoiceFormat)
        accountFields.invoiceFormat = req.body.invoiceFormat;

      try {
        // Create
        account = new Account(accountFields);
        await account.save();
        res.send(account);
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

// @route   PATCH api/account/
// @desc    Update Account
// @access  Private
router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const account = await Account.findOne({
      _id: req.params.id,
    });

    updates.forEach((update) => (account[update] = req.body[update]));

    await account.save();

    res.send(account);
  } catch (error) {
    console.log(error);
    // res.status(400).send(error);
  }
});
module.exports = router;

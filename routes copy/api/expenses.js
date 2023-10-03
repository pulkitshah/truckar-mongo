const express = require('express');
const { check, validationResult } = require('express-validator/check');

const Expense = require('../../models/Expense');
const auth = require('../../middlleware/auth');

const router = express.Router();

// @route   GET api/expenses/
// @desc    Get Expenses created by user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const expense = await Expense.find({
      user: req.user.id,
    });

    if (!expense) {
      res
        .status(400)
        .json({ errors: [{ msg: 'There are no expenses by this user' }] });
    }

    res.json(expense);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/expenses/defaults
// @desc    Get Expenses created by user
// @access  Private
router.get('/defaults', auth, async (req, res) => {
  try {
    const expense = await Expense.find({
      user: req.user.id,
      default: true,
    }).sort({ _id: 1 });

    if (!expense) {
      res
        .status(400)
        .json({ errors: [{ msg: 'There are no expenses by this user' }] });
    }

    res.json(expense);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

//Get expense by expense id
router.get('/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    expense = await Expense.findOne({ _id, user: req.user.id });
    if (!expense) {
      return res.status(400).send('No expense by that id');
    }
    await expense.populate('user').execPopulate();
    res.send(expense);
  } catch (error) {
    console.log(error);
    res.status(400).send('Recheck Id');
  }
});

router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).send('No expense to update');
    }

    console.log(updates);

    updates.forEach((update) => (expense[update] = req.body[update]));
    await expense.save();

    // expense = await Expense.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true})
    // console.log(user)

    res.send(expense);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   POST api/expenses/
// @desc    Create expense
// @access  Private
router.post(
  '/',
  [auth, [check('name', 'Please enter Expense Name.').not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      console.log(req.body.default);
      // Get fields
      const expenseFields = {};
      expenseFields.user = req.user.id;
      if (req.body.name) expenseFields.name = req.body.name;
      expenseFields.default = req.body.default;
      // console.log(req.user.id);
      try {
        // let expense = await Expense.findOne({ user: req.user.id });
        // // console.log(expense);

        // if (expense) {
        //   expense = await Expense.findOneAndUpdate(
        //     { user: req.user.id },
        //     { $set: expenseFields },
        //     { new: true }
        //   );
        //   return res.json(expense);
        // }
        // Create
        expense = new Expense(expenseFields);

        await expense.save();
        res.send(expense);
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

// // @route   GET api/expenses
// // @desc    Get all expenses
// // @access  Public
// router.get('/', async (req, res) => {
//   try {
//     const expenses = await Expense.find().populate('user', ['name']);
//     if (!expenses.length > 0) {
//       return res
//         .status(400)
//         .json({ errors: [{ msg: 'There are no expenses.' }] });
//     }

//     res.json(expenses);
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send('Server Error');
//   }
// });

module.exports = router;

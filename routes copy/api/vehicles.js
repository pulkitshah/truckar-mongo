const express = require('express');
const { check, validationResult } = require('express-validator/check');

const Vehicle = require('../../models/Vehicle');
const auth = require('../../middlleware/auth');

const router = express.Router();

// @route   GET api/vehicles/me
// @desc    Get Vehicles created by user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.find({
      user: req.user.id,
    });

    if (!vehicle) {
      res
        .status(400)
        .json({ errors: [{ msg: 'There are no vehicles by this user' }] });
    }

    res.json(vehicle);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

//Get vehicle by vehicle id
router.get('/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    vehicle = await Vehicle.findOne({ _id, user: req.user.id });
    if (!vehicle) {
      return res.status(400).send('No vehicle by that id');
    }
    await vehicle.populate('organisation').execPopulate();
    res.send(vehicle);
  } catch (error) {
    console.log(error);
    res.status(400).send('Recheck Id');
  }
});

//Update vehicle by vehicle id
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!vehicle) {
      return res.status(404).send('No vehicle to update');
    }

    console.log(updates);

    updates.forEach((update) => (vehicle[update] = req.body[update]));
    await vehicle.save();

    // vehicle = await Vehicle.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true})
    // console.log(user)

    res.send(vehicle);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   POST api/vehicles/
// @desc    Create vehicle
// @access  Private
router.post(
  '/',
  [
    auth,
    [check('vehicleNumber', 'Please enter Vehicle Name.').not().isEmpty()],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Get fields
      const vehicleFields = {};
      vehicleFields.user = req.user.id;
      if (req.body.vehicleNumber)
        vehicleFields.vehicleNumber = req.body.vehicleNumber.toUpperCase();
      if (req.body.make) vehicleFields.make = req.body.make;
      if (req.body.model) vehicleFields.model = req.body.model;
      if (req.body.yearOfPurchase)
        vehicleFields.yearOfPurchase = req.body.yearOfPurchase;
      if (req.body.condition) vehicleFields.condition = req.body.condition;
      if (req.body.organisation)
        vehicleFields.organisation = req.body.organisation;

      // console.log(req.user.id);
      try {
        // Create Vehicle
        vehicle = new Vehicle(vehicleFields);

        await vehicle.save();
        await vehicle.populate('organisation', ['name']).execPopulate();

        res.send(vehicle);
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

// @route   GET api/vehicles/me
// @desc    Get Vehicles created by user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      user: req.user.id,
    }).populate('organisation', ['name']);

    if (!vehicles.length > 0) {
      return res.status(200).json(vehicles);
    }

    res.json(vehicles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/vehicles/owned
// @desc    Check if Vehicle is owned by the user
// @access  Private
router.post(
  '/owned',
  [
    auth,
    [check('vehicleNumber', 'Please enter Vehicle Number.').not().isEmpty()],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Get fields
      const vehicleFields = {};
      vehicleFields.user = req.user.id;
      if (req.body.vehicleNumber)
        vehicleFields.vehicleNumber = req.body.vehicleNumber.toUpperCase();
      try {
        // Create Vehicle
        vehicle = await Vehicle.findOne({
          user: req.user.id,
          vehicleNumber: vehicleFields.vehicleNumber,
        });

        if (vehicle) {
          console.log(vehicle);
          res.send(vehicle);
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

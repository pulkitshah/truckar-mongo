const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { getWhatsappId } = require('../../utils/whatsapp');
const Driver = require('../../models/Driver');
const Vehicle = require('../../models/Vehicle');
const auth = require('../../middlleware/auth');

const router = express.Router();

// @route   GET api/drivers/me
// @desc    Get Drivers created by user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const driver = await Driver.find({
      user: req.user.id,
    });
    // console.log(driver);

    if (!driver) {
      res
        .status(400)
        .json({ errors: [{ msg: 'There are no drivers by this user' }] });
    }

    const drivers = [];
    for (var i in driver) {
      if (driver[i].vehicle) {
        vehicle = await Vehicle.findById(driver[i].vehicle);
        vehicle1 = {
          _id: vehicle._id,
          vehicleNumber: vehicle.vehicleNumber,
        };
        let updatedDriver = {
          _id: driver[i]._id,
          user: req.user.id,
          name: driver[i].name,
          vehicle: vehicle1,
        };
        drivers.push(updatedDriver);
      } else {
        drivers.push(driver[i]);
      }
    }

    res.json(drivers);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

//Get driver by driver id
router.get('/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    driver = await Driver.findOne({ _id, user: req.user.id });
    if (!driver) {
      return res.status(400).send('No driver by that id');
    }
    await driver.populate('vehicle').execPopulate();
    res.send(driver);
  } catch (error) {
    console.log(error);
    res.status(400).send('Recheck Id');
  }
});

//Get driver by vehicle id
router.get('/vehicle/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    driver = await Driver.findOne({ vehicle: _id, user: req.user.id });
    if (!driver) {
      return res.send([]);
    }
    await driver.populate('vehicle').execPopulate();
    res.send(driver);
  } catch (error) {
    console.log(error);
    res.status(400).send('Recheck Id');
  }
});

//Update driver by driver id
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const driver = await Driver.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!driver) {
      return res.status(404).send('No driver to update');
    }

    updates.forEach((update) => (driver[update] = req.body[update]));
    if (req.body.mobile) {
      // Check Whatsapp Status
      const contact = await getWhatsappId(req.body.mobile);
      driver.waId = contact.wa_id;
    }
    await driver.save();

    // driver = await Driver.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true})
    // console.log(user)

    res.send(driver);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// @route   POST api/drivers/
// @desc    Create driver
// @access  Private
router.post(
  '/',
  [auth, [check('name', 'Please enter Driver Name.').not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Get fields
      const driverFields = {};
      driverFields.user = req.user.id;
      if (req.body.name) driverFields.name = req.body.name;
      if (req.body.vehicle) {
        vehicle = await Vehicle.findOne({
          _id: req.body.vehicle,
          user: req.user.id,
        });
        // console.log(vehicle);
        driverFields.organisation = vehicle.organisation;
        driverFields.vehicle = req.body.vehicle;

        if (req.body.mobile) {
          driverFields.mobile = req.body.mobile;

          // Check Whatsapp Status
          const contact = await getWhatsappId(req.body.mobile);
          driver.waId = contact.wa_id;
        }
      }

      // console.log(req.user.id);
      try {
        // Create Driver
        driver = new Driver(driverFields);

        await driver.save();
        await driver.populate('vehicle', ['vehicleNumber']).execPopulate();

        res.send(driver);
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

// // @route   GET api/drivers
// // @desc    Get all drivers
// // @access  Public
// router.get('/', async (req, res) => {
//   try {
//     const drivers = await Driver.find().populate('user', ['name']);
//     if (!drivers.length > 0) {
//       return res
//         .status(400)
//         .json({ errors: [{ msg: 'There are no drivers.' }] });
//     }

//     res.json(drivers);
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send('Server Error');
//   }
// });

module.exports = router;

const express = require('express');
const { check, validationResult } = require('express-validator/check');

const Order = require('../../models/Order');
const Trip = require('../../models/Trip');
const Delivery = require('../../models/Delivery');

const auth = require('../../middlleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @route   GET api/reports/
// @desc    Get truck reports
// @access  Private

router.get('/truckIncomePerDay', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    });

    if (!orders) {
      res
        .status(400)
        .json({ errors: [{ msg: 'There are no orders by this user' }] });
    }
    let response = [];

    response = await Promise.all(
      orders.map(async (order) => {
        let orderFields = {};
        // SETTING RESPONSE FIELDS
        if (order._id) orderFields._id = order._id;
        if (order.orderNo) orderFields.orderNo = order.orderNo;
        if (order.customer) orderFields.customer = order.customer;
        if (order.saleDate) orderFields.saleDate = order.saleDate;
        if (order.createdDate) orderFields.createdDate = order.createdDate;

        const trips = await Trip.find({
          order: order._id,
        })
          .populate('driver')
          .exec();

        // SETTING RESPONSE FIELDS
        orderFields.trips = await Promise.all(
          trips.map(async (trip) => {
            let tripFields = {};
            if (trip._id) tripFields._id = trip._id;
            if (trip.route) tripFields.route = trip.route;
            if (trip.vehicle) tripFields.vehicle = trip.vehicle;
            tripFields.isVehicleOwned = trip.isVehicleOwned;
            if (trip.type) tripFields.type = trip.type;
            if (trip.tripExpenses) tripFields.tripExpenses = trip.tripExpenses;

            if (trip.vehicleNumber) {
              tripFields.vehicleNumber = trip.vehicleNumber;
            }

            //Create Sale Details
            if (trip.sale) tripFields.sale = trip.sale;

            // When isVehicleOwned = false, Create Purchase Details
            if (!tripFields.isVehicleOwned) {
              if (trip.purchase) tripFields.purchase = trip.purchase;
            } else {
              if (trip.driver) tripFields.driver = trip.driver;
            }

            tripFields.deliveries = await Delivery.find({
              trip: trip._id,
            }).exec();
            return tripFields;
          })
        );
        return orderFields;
      })
    );
    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

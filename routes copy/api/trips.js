const express = require('express');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator/check');
const moment = require('moment');
const whatsapp = require('../../utils/whatsapp');
var Location = require('ulocation');

const Order = require('../../models/Order');
const Trip = require('../../models/Trip');
const Delivery = require('../../models/Delivery');
const Expense = require('../../models/Expense');

const auth = require('../../middlleware/auth');
const getFiscalYear = require('../../utils/getFiscalYear');
const { compareSync } = require('bcryptjs');
const getShortenedUrl = require('../../utils/shortenUrl');

const router = express.Router();

// @route   GET api/trips/
// @desc    Get Orders created by user
// @access  Private

router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const deliveries = await Delivery.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: 'orders',
          let: {
            id: '$order',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$id'],
                },
              },
            },
            {
              $project: {
                orderNo: 1,
                _id: 1,
                saleDate: 1,
                customer: 1,
                createdDate: 1,
              },
            },
            {
              $lookup: {
                from: 'parties',
                let: {
                  id: '$customer',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$id'] },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      transporter: 1,
                      _id: 1,
                    },
                  },
                ],
                as: 'customer',
              },
            },
            {
              $unwind: {
                path: '$customer',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'orderDetails',
        },
      },
      { $unwind: '$orderDetails' },
      {
        $lookup: {
          from: 'trips',
          let: {
            id: '$trip',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$id'],
                },
              },
            },
            {
              $lookup: {
                from: 'parties',
                let: {
                  id: '$transporter',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$id'] },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      transporter: 1,
                      _id: 1,
                    },
                  },
                ],
                as: 'transporter',
              },
            },
            {
              $unwind: {
                path: '$transporter',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'drivers',
                let: {
                  id: '$driver',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$id'] },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      _id: 1,
                    },
                  },
                ],
                as: 'driver',
              },
            },
            {
              $unwind: {
                path: '$driver',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'trips',
        },
      },
      { $unwind: '$trips' },
      {
        $project: {
          orderNo: '$orderDetails.orderNo',
          saleDate: '$orderDetails.saleDate',
          createdDate: '$orderDetails.createdDate',
          transporter: '$trips.transporter',
          driver: '$trips.driver',
          driverMobile: '$trips.driverMobile',
          tripExpenses: '$trips.tripExpenses',
          vehicleNumber: '$trips.vehicleNumber',
          customer: '$orderDetails.customer',
          loading: '$loading.structured_formatting.main_text',
          unloading: '$unloading.structured_formatting.main_text',

          //Sale Fields
          saleRate: '$trips.sale.saleRate',
          saleType: '$trips.sale.saleType',
          saleMinimumQuantity: '$trips.sale.saleMinimumQuantity',
          saleOthers: '$trips.sale.others',

          //Purchase Fields
          purchaseRate: '$trips.purchase.purchaseRate',
          purchaseType: '$trips.purchase.purchaseType',
          purchaseMinimumQuantity: '$trips.purchase.purchaseMinimumQuantity',
          purchaseOthers: '$trips.purchase.others',

          lrNo: 1,
          billWeight: 1,
          unloadingWeight: 1,
          weighbridgeName: 1,
          status: 1,
        },
      },
      { $sort: { saleDate: -1, createdDate: -1 } },
      { $limit: startIndex + limit },
      { $skip: startIndex },
    ]);
    res.json(deliveries);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/trips/:tripId
// @desc    Patch trips created by user
// @access  Private

router.patch('/:tripId', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const trip = await Trip.findOne({
      _id: req.params.tripId,
      user: req.user.id,
    })
      .populate('driver')
      .populate('transporter');

    const order = await Order.findOne({
      _id: trip.order,
      user: req.user.id,
    }).populate('customer');

    if (!trip) {
      return res.status(404).send('No trip to update');
    }

    updates.forEach((update) => {
      if (update.includes('sale')) {
        trip.markModified('sale');
        return (trip.sale[update] = req.body[update]);
      } else if (update.includes('purchase')) {
        trip.markModified('purchase');
        return (trip.purchase[update] = req.body[update]);
      } else {
        return (trip[update] = req.body[update]);
      }
    });

    if (req.body.driverArrivalTime) {
      var loc = new Location(req.header('Referer'));
      let customerUrl = await getShortenedUrl(
        `/salesorder/${order._id}`,
        req.protocol + '://' + loc.hostname
      );

      // process.env.NODE_ENV === 'production' &&
      // await whatsapp.sendBookingConfirmationToCustomers(
      //   order,
      //   trip,
      //   req.user,
      //   customerUrl._doc.shortUrl
      // );

      if (trip.transporter) {
        let transporterUrl = await getShortenedUrl(
          `/purchaseorder/${trip._id}`,
          req.protocol + '://' + loc.hostname
        );

        if (trip.purchase.purchaseType === 'commission') {
          await whatsapp.sendBookingConfirmationToOwnerForCommissionOrders(
            order,
            trip,
            req.user,
            customerUrl._doc.shortUrl,
            transporterUrl._doc.shortUrl
          );
          await whatsapp.sendBookingConfirmationToTransportersForCommissionOrders(
            order,
            trip,
            req.user,
            transporterUrl._doc.shortUrl
          );
        } else {
          await whatsapp.sendBookingConfirmationToOwnerForTradingOrders(
            order,
            trip,
            req.user,
            customerUrl._doc.shortUrl,
            transporterUrl._doc.shortUrl
          );
          await whatsapp.sendBookingConfirmationToTransporters(
            order,
            trip,
            req.user,
            transporterUrl._doc.shortUrl
          );
        }

        // process.env.NODE_ENV === 'production' &&
      } else {
        var loc = new Location(req.header('Referer'));
        await whatsapp.sendBookingConfirmationToOwnerForSelfOrders(
          order,
          trip,
          req.user,
          customerUrl._doc.shortUrl
        );
      }
    }

    await trip.save();
    // console.log(req.user);

    res.send(trip);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/trips/:tripId
// @desc    Patch trips created by user
// @access  Private

router.put('/:tripId', auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.tripId,
      user: req.user.id,
    })
      .populate('driver')
      .populate('transporter');

    const order = await Order.findOne({
      _id: trip.order,
      user: req.user.id,
    }).populate('customer');

    if (!trip) {
      return res.status(404).send('No trip to update');
    }

    var loc = new Location(req.header('Referer'));
    let customerUrl = await getShortenedUrl(
      `/salesorder/${order._id}`,
      req.protocol + '://' + loc.hostname
    );

    await whatsapp.sendBookingConfirmationToCustomers(
      order,
      trip,
      req.user,
      customerUrl._doc.shortUrl
    );
    // console.log(req.user);

    res.send(trip);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/trips/updateTripExpense/:tripId
// @desc    Update Trip expenses
// @access  Private

router.patch('/updateTripExpense/:tripId', auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    const expense = await Expense.findOne({
      _id: req.body.expenseId,
      user: req.user.id,
    });

    const trip = await Trip.findOne({
      _id: req.params.tripId,
      user: req.user.id,
    });

    if (!trip) {
      return res.status(404).send('No trip to update');
    }

    let tripExpenses = trip.tripExpenses;

    let filteredExpenses = trip._doc.tripExpenses.filter((tripExpense) => {
      return (
        tripExpense.expenseName._id.toString() !== req.body.expenseId.toString()
      );
    });

    let newExpense = {
      expenseAmount: req.body.expenseAmount,
      expenseName: expense._doc,
    };
    filteredExpenses.push(newExpense);
    trip.markModified('tripExpenses');
    trip.tripExpenses = filteredExpenses;

    await trip.save();

    res.send(filteredExpenses);
  } catch (error) {
    res.status(400).send(error);
  }
});
module.exports = router;

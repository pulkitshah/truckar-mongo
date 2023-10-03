const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const moment = require("moment");
const whatsapp = require("../../utils/whatsapp");
const Order = require("../../models/Order");
const Trip = require("../../models/Trip");
const Delivery = require("../../models/Delivery");
const Lr = require("../../models/Lr");
const Invoice = require("../../models/Invoice");

const auth = require("../../middlleware/auth");
const getFiscalYear = require("../../utils/getFiscalYear");
const { compareSync } = require("bcryptjs");

const router = express.Router();

// @route   POST api/orders/
// @desc    Create order
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      // check('name', 'Please enter Order Name.').not().isEmpty(),
      // check('jurisdiction', 'Please enter Area of Jurisdiction')
      //   .not()
      //   .isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Get fields

      let orderFields = {};
      let tripFields = {};
      let deliveryFields = {};
      let isVehicleOwned = typeof req.body.vehicle === "object";
      //route

      var results = await Order.find({
        user: req.user.id,
        saleDate: {
          $lte: getFiscalYear(req.body.saleDate).current.end,
          $gte: getFiscalYear(req.body.saleDate).current.start,
        },
      });

      // Create Order Details
      orderFields.user = req.user.id;

      orderFields.orderNo = results.length + 1;

      if (req.body.customer) orderFields.customer = req.body.customer;
      if (req.body.saleDate)
        orderFields.saleDate = moment(req.body.saleDate).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        });

      order = new Order(orderFields);

      //Create Trip Details
      tripFields.isVehicleOwned = isVehicleOwned;
      tripFields.type = "loose";
      tripFields.order = order._id;
      tripFields.user = req.user.id;

      if (isVehicleOwned) {
        tripFields.vehicle = req.body.vehicle;
        tripFields.vehicleNumber = req.body.vehicle.vehicleNumber.toUpperCase();
        if (req.body.driver && !Array.isArray(req.body.driver))
          tripFields.driver = req.body.driver;
      } else {
        tripFields.vehicleNumber = req.body.vehicle.toUpperCase();
      }
      // if (req.body.vehicle) tripFields.vehicle = req.body.vehicle;

      //Create Sale Details
      if (req.body.saleType) tripFields.sale = { saleType: req.body.saleType };
      if (req.body.saleRate) tripFields.sale.saleRate = req.body.saleRate;
      if (req.body.saleMinimumQuantity)
        tripFields.sale.saleMinimumQuantity = req.body.saleMinimumQuantity;
      if (req.body.saleAdvance)
        tripFields.sale.saleAdvance = req.body.saleAdvance;

      // When isVehicleOwned = false, Create Purchase Details
      if (!isVehicleOwned) {
        if (req.body.transporter) tripFields.transporter = req.body.transporter;

        tripFields.purchase = {};
        if (req.body.purchaseType)
          tripFields.purchase.purchaseType = req.body.purchaseType;
        if (req.body.commissionType)
          tripFields.purchase.commissionType = req.body.commissionType;
        if (req.body.purchaseRate)
          tripFields.purchase.purchaseRate = req.body.purchaseRate;
        if (req.body.purchaseMinimumQuantity)
          tripFields.purchase.purchaseMinimumQuantity =
            req.body.purchaseMinimumQuantity;
        if (req.body.purchaseAdvance)
          tripFields.purchase.purchaseAdvance = req.body.purchaseAdvance;
      } else {
        if (req.body.driver.length > 0) tripFields.driver = req.body.driver;
      }
      //Create Delivery Details
      if (req.body.deliveryDetails) deliveryDetails = req.body.deliveryDetails;
      let loadingRoute = [];
      let unloadingRoute = [];

      deliveryDetails.map((delivery) => {
        if (
          loadingRoute.indexOf(
            delivery.loading.structured_formatting.main_text
          ) === -1
        ) {
          loadingRoute.push(delivery.loading.structured_formatting.main_text);
        }
        if (
          unloadingRoute.indexOf(
            delivery.unloading.structured_formatting.main_text
          ) === -1
        ) {
          unloadingRoute.push(
            delivery.unloading.structured_formatting.main_text
          );
        }
        tripFields.route = [...loadingRoute, ...unloadingRoute];
      });
      trip = new Trip(tripFields);

      let response = await Promise.all(
        deliveryDetails.map(async (delivery, index) => {
          deliveryFields.order = order._id;
          deliveryFields.user = req.user.id;
          deliveryFields.trip = trip._id;
          deliveryFields.status = "pending";
          if (index === 0 || req.body.saleType === "quantity") {
            deliveryFields.saleOthers = req.user.defaultCharges || [];
          } else {
            deliveryFields.saleOthers = req.user.extraDeliveryCharge || [];
          }

          if (delivery.loading) deliveryFields.loading = delivery.loading;
          if (delivery.unloading) deliveryFields.unloading = delivery.unloading;

          delivery = new Delivery(deliveryFields);
          await delivery.save();
          let lrArray = {};
          lrArray._id = delivery._id;
          lrArray.status = "pending";

          if (orderFields.orderNo) lrArray.orderNo = orderFields.orderNo;
          if (orderFields.saleDate) lrArray.saleDate = orderFields.saleDate;
          if (orderFields.createdDate)
            lrArray.createdDate = orderFields.createdDate;
          if (tripFields.transporter)
            lrArray.transporter = tripFields.transporter;
          if (tripFields.driver) lrArray.driver = tripFields.driver;
          if (tripFields.tripExpenses)
            lrArray.tripExpenses = tripFields.tripExpenses;
          if (tripFields.vehicleNumber)
            lrArray.vehicleNumber = tripFields.vehicleNumber.toUpperCase();
          if (tripFields.owner) lrArray.owner = tripFields.vehicle.owner;

          if (orderFields.customer) lrArray.customer = orderFields.customer;
          if (delivery.unloading.structured_formatting.main_text)
            lrArray.loading = delivery.loading.structured_formatting.main_text;
          if (delivery.unloading.structured_formatting.main_text)
            lrArray.unloading =
              delivery.unloading.structured_formatting.main_text;
          if (delivery.saleOthers) lrArray.saleOthers = delivery.saleOthers;

          //Sale Fields
          if (tripFields.sale.saleRate)
            lrArray.saleRate = tripFields.sale.saleRate;
          if (tripFields.sale.saleType)
            lrArray.saleType = tripFields.sale.saleType;
          if (tripFields.sale.saleMinimumQuantity)
            lrArray.saleMinimumQuantity = tripFields.sale.saleMinimumQuantity;

          if (tripFields.sale.saleAdvance)
            lrArray.saleAdvance = tripFields.sale.saleAdvance;
          if (tripFields.sale.saleBillNo)
            lrArray.saleBillNo = tripFields.sale.saleBillNo;

          //Purchase Fields
          if (tripFields.purchase)
            lrArray.purchaseRate = tripFields.purchase.purchaseRate;
          if (tripFields.purchase)
            lrArray.purchaseType = tripFields.purchase.purchaseType;
          if (tripFields.purchase && tripFields.purchase.commissionType)
            lrArray.commissionType = tripFields.purchase.commissionType;
          if (tripFields.purchase)
            lrArray.purchaseMinimumQuantity =
              tripFields.purchaseMinimumQuantity;
          if (tripFields.purchase)
            lrArray.purchaseOthers = tripFields.purchase.purchaseOthers;
          if (tripFields.purchase)
            lrArray.purchaseAdvance = tripFields.purchase.purchaseAdvance;
          if (tripFields.purchase)
            lrArray.purchaseBillNo = tripFields.purchase.purchaseBillNo;

          if (order._id) lrArray.order = order._id;
          if (trip._id) lrArray.trip = trip._id;
          return lrArray;
        })
      );

      try {
        await trip.save();
        await order.save();

        res.status(200).send(response);
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

// @route   POST api/orders/:id/edit
// @desc    Update order
// @access  Private
router.post(
  "/:id/edit",
  [
    auth,
    [
      // check('name', 'Please enter Order Name.').not().isEmpty(),
      // check('jurisdiction', 'Please enter Area of Jurisdiction')
      //   .not()
      //   .isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Get fields
      let order = { _id: req.params.id };
      let tripFields = {};
      let isVehicleOwned = typeof req.body.vehicle === "object";

      // Update order model
      await Order.findOneAndUpdate(
        {
          user: req.user.id,
          _id: req.params.id,
        },
        {
          customer: req.body.customer,
          saleDate: req.body.saleDate,
          orderNo: req.body.orderNo,
        },
        { new: true }
      );

      const trip = await Trip.findOne({
        user: req.user.id,
        order: req.params.id,
      });

      //Create Trip Details
      tripFields.isVehicleOwned = isVehicleOwned;
      tripFields.type = "loose";
      tripFields.order = order._id;
      tripFields.user = req.user.id;

      if (isVehicleOwned) {
        tripFields.vehicle = req.body.vehicle;
        tripFields.vehicleNumber = req.body.vehicle.vehicleNumber.toUpperCase();
        if (req.body.driver && !Array.isArray(req.body.driver))
          tripFields.driver = req.body.driver;
      } else {
        tripFields.vehicleNumber = req.body.vehicle.toUpperCase();
      }
      // if (req.body.vehicle) tripFields.vehicle = req.body.vehicle;

      //Create Sale Details
      if (req.body.saleType) tripFields.sale = { saleType: req.body.saleType };
      if (req.body.saleRate) tripFields.sale.saleRate = req.body.saleRate;
      if (req.body.saleMinimumQuantity)
        tripFields.sale.saleMinimumQuantity = req.body.saleMinimumQuantity;
      if (req.body.saleAdvance)
        tripFields.sale.saleAdvance = req.body.saleAdvance;

      // When isVehicleOwned = false, Create Purchase Details
      if (!isVehicleOwned) {
        if (req.body.transporter) tripFields.transporter = req.body.transporter;

        tripFields.purchase = {};
        if (req.body.purchaseType)
          tripFields.purchase.purchaseType = req.body.purchaseType;
        if (req.body.commissionType)
          tripFields.purchase.commissionType = req.body.commissionType;

        if (req.body.purchaseRate)
          tripFields.purchase.purchaseRate = req.body.purchaseRate;
        if (req.body.purchaseMinimumQuantity)
          tripFields.purchase.purchaseMinimumQuantity =
            req.body.purchaseMinimumQuantity;
        if (req.body.purchaseAdvance)
          tripFields.purchase.purchaseAdvance = req.body.purchaseAdvance;
      } else {
        if (req.body.driver) tripFields.driver = req.body.driver;
      }
      //Create Delivery Details
      if (req.body.deliveryDetails) deliveryDetails = req.body.deliveryDetails;
      let loadingRoute = [];
      let unloadingRoute = [];

      deliveryDetails.map((delivery) => {
        if (
          loadingRoute.indexOf(
            delivery.loading.structured_formatting.main_text
          ) === -1
        ) {
          loadingRoute.push(delivery.loading.structured_formatting.main_text);
        }
        if (
          unloadingRoute.indexOf(
            delivery.unloading.structured_formatting.main_text
          ) === -1
        ) {
          unloadingRoute.push(
            delivery.unloading.structured_formatting.main_text
          );
        }
        tripFields.route = [...loadingRoute, ...unloadingRoute];
      });
      // trip = new Trip(tripFields);

      let response = await Promise.all(
        deliveryDetails.map(async (delivery) => {
          // console.log(delivery);

          if (delivery._id) {
            const del = Delivery.find({
              user: req.user.id,
              _id: delivery._id,
            });
            let deliveryFields = {};

            // deliveryFields.order = order._id;
            // deliveryFields.user = req.user.id;
            // deliveryFields.trip = trip._id;
            deliveryFields.status = "pending";

            if (delivery.loading) deliveryFields.loading = delivery.loading;
            if (delivery.unloading)
              deliveryFields.unloading = delivery.unloading;

            // delivery = new Delivery(deliveryFields);
            await del.update(deliveryFields);
            // await delivery.save();
          } else {
            let deliveryFields = {};
            deliveryFields.order = order._id;
            deliveryFields.user = req.user.id;
            deliveryFields.trip = trip._id;
            deliveryFields.status = "pending";

            if (delivery.loading) deliveryFields.loading = delivery.loading;
            if (delivery.unloading)
              deliveryFields.unloading = delivery.unloading;

            newDelivery = new Delivery(deliveryFields);
            // console.log(newDelivery);
            // await del.update(deliveryFields);
            await newDelivery.save();
          }

          let lrArray = {};
          lrArray._id = delivery._id;

          if (req.body.orderNo) lrArray.orderNo = req.body.orderNo;
          if (req.body.saleDate) lrArray.saleDate = req.body.saleDate;
          if (tripFields.transporter)
            lrArray.transporter = tripFields.transporter;
          if (tripFields.driver) lrArray.driver = tripFields.driver;
          if (tripFields.tripExpenses)
            lrArray.tripExpenses = tripFields.tripExpenses;
          if (tripFields.vehicleNumber)
            lrArray.vehicleNumber = tripFields.vehicleNumber.toUpperCase();
          if (tripFields.owner) lrArray.owner = tripFields.vehicle.owner;

          if (req.body.customer) lrArray.customer = req.body.customer;
          if (delivery.unloading.structured_formatting.main_text)
            lrArray.loading = delivery.loading.structured_formatting.main_text;
          if (delivery.unloading.structured_formatting.main_text)
            lrArray.unloading =
              delivery.unloading.structured_formatting.main_text;

          //Sale Fields
          if (tripFields.sale.saleRate)
            lrArray.saleRate = tripFields.sale.saleRate;
          if (tripFields.sale.saleType)
            lrArray.saleType = tripFields.sale.saleType;
          if (tripFields.sale.saleMinimumQuantity)
            lrArray.saleMinimumQuantity = tripFields.sale.saleMinimumQuantity;
          if (tripFields.sale.saleOthers)
            lrArray.saleOthers = tripFields.sale.saleOthers;
          if (tripFields.sale.saleAdvance)
            lrArray.saleAdvance = tripFields.sale.saleAdvance;
          if (tripFields.sale.saleBillNo)
            lrArray.saleBillNo = tripFields.sale.saleBillNo;

          //Purchase Fields
          if (tripFields.purchase)
            lrArray.purchaseRate = tripFields.purchase.purchaseRate;
          if (tripFields.purchase)
            lrArray.purchaseType = tripFields.purchase.purchaseType;
          if (tripFields.purchase)
            lrArray.purchaseMinimumQuantity = tripFields.purchase;
          if (tripFields.purchase)
            lrArray.purchaseOthers = tripFields.purchase.purchaseOthers;
          if (tripFields.purchase)
            lrArray.purchaseAdvance = tripFields.purchase.purchaseAdvance;
          if (tripFields.purchase)
            lrArray.purchaseBillNo = tripFields.purchase.purchaseBillNo;

          if (order._id) lrArray.order = order._id;
          if (trip._id) lrArray.trip = trip._id;
          return lrArray;
        })
      );
      try {
        // await order.save();
        await trip.update(tripFields);
        res.status(200).send(response);
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

// @route   PATCH api/orders/others/:TripId
// @desc    Update Trip others expenses/income
// @access  Private

router.patch("/others/:type/:id", auth, async (req, res) => {
  // const updates = Object.keys(req.body);
  try {
    let trip;

    if (req.params.type === "purchase") {
      trip = await Trip.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.id,
        },
        { $set: { "purchase.others": req.body.orderExpenses } },
        { new: true, upsert: true }
      );
    } else {
      trip = await Trip.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.id,
        },
        { $set: { "sale.others": req.body.orderExpenses } },
        { new: true, upsert: true }
      );
    }

    if (!trip) {
      return res.status(404).send("No Trips to update");
    }

    let tripFields = {};
    if (trip._id) tripFields._id = trip._id;
    if (trip.route) tripFields.route = trip.route;
    if (trip.vehicle) tripFields.vehicle = trip.vehicle;

    tripFields.isVehicleOwned = trip.isVehicleOwned;
    if (trip.type) tripFields.type = trip.type;
    if (trip.tripExpenses) tripFields.tripExpenses = trip.tripExpenses;
    if (trip.driver) tripFields.driver = trip.driver;

    if (trip.vehicleNumber) {
      tripFields.vehicleNumber = trip.vehicleNumber.toUpperCase();
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
    // return tripFields;

    res.send(tripFields);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   PATCH api/orders/
// @desc    Modify orders
// @access  Private

router.patch("/:orderId", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).send("No order to update");
    }

    updates.forEach((update) => (order[update] = req.body[update]));
    await order.save();

    res.send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   PATCH api/orders/expense/:TripId
// @desc    Update Trip expenses
// @access  Private

router.patch("/expense/:id", auth, async (req, res) => {
  // const updates = Object.keys(req.body);

  try {
    const trip = await Trip.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      { $set: { tripExpenses: req.body.orderExpenses } },
      { new: true }
    );
    // console.log(trip);

    if (!trip) {
      return res.status(404).send("No Trips to update");
    }

    res.send(trip);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   GET api/orders/expense/:TripId
// @desc    Get Trip expenses by Trip ID
// @access  Private

router.get("/expense/:id", auth, async (req, res) => {
  // const updates = Object.keys(req.body);

  try {
    const trip = await Trip.find({
      _id: req.params.id,
      user: req.user.id,
    });
    // console.log(trip);

    if (!trip) {
      return res.status(404).send("No Trips to update");
    }

    return res.send(trip);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   GET api/orders/deliveries/
// @desc    Get Trip Deliveries
// @access  Private

router.get("/deliveries/", auth, async (req, res) => {
  // const updates = Object.keys(req.body);

  try {
    const orders = await Order.find({
      user: req.user.id,
    });

    const trips = await Trip.find({
      user: req.user.id,
    })
      .populate("driver")
      .exec();

    const deliveries = await Delivery.find({
      user: req.user.id,
    }).exec();

    if (!deliveries) {
      return res.status(404).send("No Delivery found");
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

        // SETTING RESPONSE FIELDS
        orderFields.trips = await Promise.all(
          trips
            .filter((trip) => trip.order.toString() === order._id.toString())
            .map(async (trip) => {
              let tripFields = {};
              if (trip._id) tripFields._id = trip._id;
              if (trip.route) tripFields.route = trip.route;
              if (trip.vehicle) tripFields.vehicle = trip.vehicle;
              tripFields.isVehicleOwned = trip.isVehicleOwned;
              if (trip.type) tripFields.type = trip.type;
              if (trip.tripExpenses)
                tripFields.tripExpenses = trip.tripExpenses;

              if (trip.vehicleNumber) {
                tripFields.vehicleNumber = trip.vehicleNumber.toUpperCase();
              }

              //Create Sale Details
              if (trip.sale) tripFields.sale = trip.sale;

              // When isVehicleOwned = false, Create Purchase Details
              if (!tripFields.isVehicleOwned) {
                if (trip.purchase) tripFields.purchase = trip.purchase;
              } else {
                if (trip.driver) tripFields.driver = trip.driver;
              }

              tripFields.deliveries = deliveries.filter(
                (delivery) => delivery.trip.toString() === trip._id.toString()
              );
              return tripFields;
            })
        );
        return orderFields;
      })
    );

    // console.log(response);
    res.json(response);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   GET api/orders/deliveries/:TripId
// @desc    Get Trip Deliveries by Trip ID
// @access  Private

router.get("/deliveries/:id", auth, async (req, res) => {
  // const updates = Object.keys(req.body);

  try {
    const delivery = await Delivery.find({
      trip: req.params.id,
      user: req.user.id,
    });

    if (!delivery) {
      return res.status(404).send("No Delivery found");
    }

    return res.send(delivery);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   Patch api/orders/deliveries/:TripId
// @desc    Update Bill Weight and unoading Weight
// @access  Private

router.patch("/delivery/:id", auth, async (req, res) => {
  // const updates = Object.keys(req.body);

  const updates = Object.keys(req.body);

  try {
    const delivery = await Delivery.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!delivery) {
      return res.status(404).send("No Delivery to update");
    }

    // console.log(updates);

    updates.forEach((update) => (delivery[update] = req.body[update]));
    await delivery.save();

    // party = await Party.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true})
    // console.log(user)

    // console.log(delivery);
    res.send(delivery);

    // try {
    //   const delivery = await Delivery.findOneAndUpdate(
    //     {
    //       _id: req.params.id,
    //       user: req.user.id,
    //     },
    //     {
    //       $set: {
    //         billWeight: req.body.billWeight,
    //         unloadingWeight: req.body.unloadingWeight,
    //       },
    //     },
    //     { new: true }
    //   );

    //   if (!delivery) {
    //     return res.status(404).send('No Delivery found');
    //   }
    //   // delivery.billWeight = req.body.billWeight

    //   return res.send(delivery);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   GET api/orders/trips/:TripId
// @desc    Get Trip by Trip ID
///////////////////////////////// @access  Public

router.get("/trips/:id", async (req, res) => {
  // const updates = Object.keys(req.body);

  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
    });

    const orders = await Order.find({
      _id: trip.order,
    })
      .populate("customer")
      .populate("user");

    if (!orders) {
      res
        .status(400)
        .json({ errors: [{ msg: "There are no orders by this user" }] });
    }

    let response = [];

    response = await Promise.all(
      orders.map(async (order) => {
        let orderFields = {};
        // SETTING RESPONSE FIELDS
        if (order._id) orderFields._id = order._id;
        if (order.user) {
          orderFields.userMarketName = order.user.marketName;
        }
        if (order.orderNo) orderFields.orderNo = order.orderNo;
        if (order.customer) orderFields.customer = order.customer;
        if (order.saleDate) orderFields.saleDate = order.saleDate;
        if (order.createdDate) orderFields.createdDate = order.createdDate;

        const trips = await Trip.find({
          order: order._id,
        })
          .populate("driver")
          .populate("vehicle")
          .populate("transporter")
          .exec();
        // console.log(trips[0].transporter);
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
            if (trip.driver) tripFields.driver = trip.driver;
            if (trip.driverMobile) tripFields.driverMobile = trip.driverMobile;

            if (trip.vehicleNumber) {
              tripFields.vehicleNumber = trip.vehicleNumber.toUpperCase();
            }

            if (!tripFields.isVehicleOwned) {
              tripFields.transporter = trip.transporter;
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

    // console.log(response[0]);
    res.json(response[0]);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   GET api/orders/old
// @desc    Old way to get Orders created by user
// @access  Private

router.get("/old", auth, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("customer", [])
      .limit(limit)
      .skip(startIndex)
      .sort({ saleDate: -1, createdDate: -1 });

    const ordersc = await Order.find({ user: req.user.id });
    let l = ordersc.length;

    const trips = await Trip.find({
      user: req.user.id,
    })
      .populate("driver")
      .populate("transporter")

      .exec();

    const deliveries = await Delivery.find({
      user: req.user.id,
    }).exec();

    // console.log(trips);
    // console.log(deliveries);

    if (!orders) {
      res
        .status(400)
        .json({ errors: [{ msg: "There are no orders by this user" }] });
    }
    let response = [];

    response = await Promise.all(
      orders.map(async (order) => {
        let orderFields = {};
        // SETTING RESPONSE FIELDS
        if (order._id) orderFields._id = order._id;
        orderFields.le = l;

        if (order.orderNo) orderFields.orderNo = order.orderNo;
        if (order.customer) orderFields.customer = order.customer;
        if (order.saleDate) orderFields.saleDate = order.saleDate;
        if (order.createdDate) orderFields.createdDate = order.createdDate;

        // console.log(order.customer);
        // SETTING RESPONSE FIELDS
        orderFields.trips = await Promise.all(
          trips
            .filter((trip) => trip.order.toString() === order._id.toString())
            .map(async (trip) => {
              let tripFields = {};
              if (trip._id) tripFields._id = trip._id;
              if (trip.route) tripFields.route = trip.route;
              if (trip.vehicle) tripFields.vehicle = trip.vehicle;
              tripFields.isVehicleOwned = trip.isVehicleOwned;
              if (trip.type) tripFields.type = trip.type;
              if (trip.tripExpenses)
                tripFields.tripExpenses = trip.tripExpenses;

              if (trip.vehicleNumber) {
                tripFields.vehicleNumber = trip.vehicleNumber.toUpperCase();
              }

              //Create Sale Details
              if (trip.sale) tripFields.sale = trip.sale;

              // When isVehicleOwned = false, Create Purchase Details
              if (!tripFields.isVehicleOwned) {
                if (trip.purchase) tripFields.purchase = trip.purchase;
                if (trip.transporter)
                  tripFields.purchase.transporter = trip.transporter;
              } else {
                if (trip.driver) tripFields.driver = trip.driver;
              }

              tripFields.deliveries = deliveries.filter(
                (delivery) => delivery.trip.toString() === trip._id.toString()
              );
              return tripFields;
            })
        );
        return orderFields;
      })
    );

    // console.log(response);
    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/orders/
// @desc    Get Orders created by user
// @access  Private

router.get("/", auth, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const orders = await Order.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(req.user.id) },
      },
      { $sort: { saleDate: -1, createdDate: -1 } },
      { $limit: startIndex + limit },
      { $skip: startIndex },
      {
        $lookup: {
          from: "parties",
          let: {
            id: "$customer",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
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
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $lookup: {
          from: "trips",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$order", "$$id"],
                },
              },
            },
            {
              $lookup: {
                from: "parties",
                let: {
                  id: "$transporter",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$id"] },
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
                as: "purchase.transporter",
              },
            },
            {
              $unwind: {
                path: "$purchase.transporter",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "drivers",
                let: {
                  id: "$driver",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$id"] },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      _id: 1,
                    },
                  },
                ],
                as: "driver",
              },
            },
            {
              $unwind: {
                path: "$driver",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "deliveries",
                let: {
                  id: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$trip", "$$id"],
                      },
                    },
                  },
                  {
                    $project: {
                      loading: { structured_formatting: { main_text: 1 } },
                      unloading: { structured_formatting: { main_text: 1 } },
                      lrNo: 1,
                      billWeight: 1,
                      unloadingWeight: 1,
                      status: 1,
                    },
                  },
                ],
                as: "deliveries",
              },
            },
          ],
          as: "trips",
        },
      },
    ]);
    res.json(orders);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/orders/orderids
// @desc    Get Orders created by user
// @access  Private

router.get("/orderids/", auth, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const orders = await Order.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(req.user.id) },
      },
      { $sort: { saleDate: -1, createdDate: -1 } },
      // { $limit: startIndex + limit },
      // { $skip: startIndex },

      {
        $project: {
          _id: 1,
        },
      },
    ]);
    res.json(orders);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/orders/:OrderID
// @desc    Get Orders by orderID created by user
///////////////////////////////// @access  Public

router.get("/:id", async (req, res) => {
  try {
    const orders = await Order.find({
      _id: req.params.id,
    })
      .populate("customer")
      .populate("user");

    if (!orders) {
      res
        .status(400)
        .json({ errors: [{ msg: "There are no orders by this user" }] });
    }

    let response = [];

    response = await Promise.all(
      orders.map(async (order) => {
        let orderFields = {};
        // SETTING RESPONSE FIELDS
        if (order._id) orderFields._id = order._id;
        if (order.user) {
          orderFields.userMarketName = order.user.marketName;
        }
        if (order.orderNo) orderFields.orderNo = order.orderNo;
        if (order.customer) orderFields.customer = order.customer;
        if (order.saleDate) orderFields.saleDate = order.saleDate;
        if (order.createdDate) orderFields.createdDate = order.createdDate;

        const trips = await Trip.find({
          order: order._id,
        })
          .populate("driver")
          .populate("vehicle")
          .populate("transporter")
          .exec();
        // console.log(trips[0].transporter);
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
            if (trip.driver) tripFields.driver = trip.driver;
            if (trip.driverMobile) tripFields.driverMobile = trip.driverMobile;

            if (trip.vehicleNumber) {
              tripFields.vehicleNumber = trip.vehicleNumber.toUpperCase();
            }

            if (!tripFields.isVehicleOwned) {
              tripFields.transporter = trip.transporter;
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

    // console.log(response[0]);
    res.json(response[0]);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

const orders = async (req, id) => {
  return await Order.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(req.user.id), _id: id },
    },
    { $sort: { saleDate: -1, createdDate: -1 } },

    {
      $lookup: {
        from: "parties",
        let: {
          id: "$customer",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
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
        as: "customer",
      },
    },
    { $unwind: "$customer" },
    {
      $lookup: {
        from: "trips",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$order", "$$id"],
              },
            },
          },
          {
            $lookup: {
              from: "parties",
              let: {
                id: "$transporter",
              },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$id"] },
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
              as: "purchase.transporter",
            },
          },
          {
            $unwind: {
              path: "$purchase.transporter",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "drivers",
              let: {
                id: "$driver",
              },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$id"] },
                  },
                },
                {
                  $project: {
                    name: 1,
                    _id: 1,
                  },
                },
              ],
              as: "driver",
            },
          },
          {
            $unwind: {
              path: "$driver",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "deliveries",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$trip", "$$id"],
                    },
                  },
                },
                {
                  $project: {
                    loading: { structured_formatting: { main_text: 1 } },
                    unloading: { structured_formatting: { main_text: 1 } },
                    lrNo: 1,
                    billWeight: 1,
                    unloadingWeight: 1,
                    status: 1,
                  },
                },
              ],
              as: "deliveries",
            },
          },
        ],
        as: "trips",
      },
    },
  ]);
};

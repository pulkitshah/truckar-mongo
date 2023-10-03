const express = require('express');
const { check, validationResult } = require('express-validator/check');
const moment = require('moment');
const request = require('request');
const locations = require('../../utils/locationArray');
const axios = require('axios').default;

const Order = require('../../models/Order');
const Trip = require('../../models/Trip');
const Delivery = require('../../models/Delivery');
const Party = require('../../models/Party');
const Vehicle = require('../../models/Vehicle');
const Driver = require('../../models/Driver');

const auth = require('../../middlleware/auth');
const { v4: uuidv4 } = require('uuid');
const { findOneAndUpdate, findByIdAndUpdate } = require('../../models/Order');
const { getWhatsappId } = require('../../utils/whatsapp');

// const { response } = require('express');

const router = express.Router();

// @route   POST api/orderbulk/parties
// @desc    Create order
// @access  Private

router.post('/parties', auth, async (req, res) => {
  try {
    if (!constants) {
      res
        .status(400)
        .json({ errors: [{ msg: 'There are no constants by this user' }] });
    }

    filteredConstants = constants.filter((constant) => Boolean(constant.party));

    let partiesArray = await Promise.all(
      filteredConstants.map(async (constant) => {
        let partyFields = {};
        partyFields.user = req.user.id;
        if (constant.party) partyFields.name = constant.party;
        partyFields.transporter = true;
        return partyFields;
      })
    );
    console.log('partiesArray');
    console.log(partiesArray);
    parties = await Party.insertMany(partiesArray);
    res.json(partiesArray);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/orderbulk/drivers
// @desc    Create order
// @access  Private

router.post('/drivers', auth, async (req, res) => {
  try {
    if (!constants) {
      res
        .status(400)
        .json({ errors: [{ msg: 'There are no constants by this user' }] });
    }

    filteredConstants = constants.filter((constant) =>
      Boolean(constant.driver)
    );

    let driversArray = await Promise.all(
      filteredConstants.map(async (constant) => {
        let driverFields = {};
        driverFields.user = req.user.id;
        if (constant.driver) driverFields.name = constant.driver;
        return driverFields;
      })
    );
    console.log('driverArray');
    console.log(driversArray);
    drivers = await Driver.insertMany(driversArray);
    res.json(drivers);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/orderbulk/drivers
// @desc    Create order
// @access  Private

router.get('/delete', auth, async (req, res) => {
  try {
    Order.remove({}, function (err) {
      console.log('collection removed');
    });
    Party.remove({}, function (err) {
      console.log('collection removed');
    });
    Driver.remove({}, function (err) {
      console.log('collection removed');
    });
    Trip.remove({}, function (err) {
      console.log('collection removed');
    });
    Delivery.remove({}, function (err) {
      console.log('collection removed');
    });
    res.json('Deleted');
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});
// @route   POST api/orderbulk/
// @desc    Create order
// @access  Private

router.post('/:id', auth, async (req, res) => {
  try {
    filteredOrders = orders.filter(
      (order) =>
        parseInt(order.orderNo) < req.params.id &&
        parseInt(order.orderNo) > req.params.id - 2
    );
    let ordersArray = await Promise.all(
      filteredOrders.map(async (order) => {
        let orderFields = {};
        // SETTING RESPONSE FIELDS
        // if (order._id) orderFields._id = order._id;
        orderFields.user = req.user.id;
        if (order.orderNo) orderFields.orderNo = order.orderNo;

        // SET Customer or Create Customer
        if (order.customer) {
          let c = await Party.findOne({
            name: order.customer,
          });
          orderFields.customer = c;
        }

        console.log(orderFields.customer);

        // SET Sale Date
        if (order.saleDate) orderFields.saleDate = order.saleDate;
        if (order.saleInvoice) orderFields.saleInvoice = order.saleInvoice;

        newOrder = new Order(orderFields);
        return orderFields;
      })
    );
    Order.insertMany(ordersArray, async (err, docs) => {
      if (err) {
        console.log(error.message);
      } else {
        try {
          let tripsArray = await Promise.all(
            docs.map(async (order) => {
              let tripFields = {};
              tripFields.type = 'loose';
              tripFields.order = order._id;
              tripFields.user = req.user.id;

              let excelTrips = [...self, ...trading].filter((trip) => {
                return parseInt(trip.orderNo) === parseInt(order.orderNo);
              });

              tripFields.orderNo = excelTrips[0].orderNo;

              if (excelTrips[0].vehicleNumber) {
                vehicle = await Vehicle.findOne({
                  vehicleNumber: excelTrips[0].vehicleNumber,
                });
                if (vehicle) {
                  tripFields.vehicle = vehicle;
                  tripFields.vehicleNumber = excelTrips[0].vehicleNumber;
                  tripFields.isVehicleOwned = isVehicleOwned = true;
                  if (excelTrips[0].driver) {
                    driver = await Driver.findOne({
                      name: excelTrips[0].driver,
                    });
                  }
                  tripFields.driver = driver;
                } else {
                  tripFields.vehicleNumber = excelTrips[0].vehicleNumber;
                  tripFields.isVehicleOwned = isVehicleOwned = false;
                }
              }
              if (excelTrips[0].saleType === 'Fixed') {
                tripFields.sale = { saleType: 'fixed' };
              } else {
                tripFields.sale = { saleType: 'quantity' };
                if (excelTrips[0].saleType === 'Minimum Quantity')
                  tripFields.sale.saleMinimumQuantity =
                    excelTrips[0].saleMinimumQuantity;
              }
              if (excelTrips[0].saleRate)
                tripFields.sale.saleRate = excelTrips[0].saleRate;
              if (order.saleAdvance)
                tripFields.sale.saleAdvance = order.saleAdvance;

              if (!tripFields.isVehicleOwned) {
                if (excelTrips[0].purchaseType === 'Fixed') {
                  tripFields.purchase = { purchaseType: 'fixed' };
                } else {
                  tripFields.purchase = { purchaseType: 'quantity' };
                  if (excelTrips[0].purchaseType === 'Minimum Quantity')
                    tripFields.purchase.purchaseMinimumQuantity =
                      excelTrips[0].purchaseMinimumQuantity;
                }
                if (excelTrips[0].purchaseRate)
                  tripFields.purchase.purchaseRate = excelTrips[0].purchaseRate;

                if (order.purchaseAdvance)
                  tripFields.purchase.purchaseAdvance = order.purchaseAdvance;
                if (order.purchaseInvoice)
                  tripFields.purchase.purchaseInvoice = order.purchaseInvoice;

                if (excelTrips[0].transporter) {
                  transporter = await Party.findOne({
                    name: excelTrips[0].transporter,
                  });
                  tripFields.transporter = transporter;

                  // tripFields.purchase.transporter = transporter;
                }
              }

              let loadingRoute = [];
              let unloadingRoute = [];

              excelTrips.forEach((trip) => {
                if (loadingRoute.indexOf(trip.loading) === -1) {
                  loadingRoute.push(trip.loading);
                }
                if (unloadingRoute.indexOf(trip.unloading) === -1) {
                  unloadingRoute.push(trip.unloading);
                }
              });
              tripFields.route = [...loadingRoute, ...unloadingRoute];

              let tripExpenses = [];
              excelTrips.forEach((trip) => {
                if (tripFields.isVehicleOwned) {
                  if (trip.diesel > 0)
                    tripExpenses.push({
                      expenseName: {
                        _id: '603bf42ca0ab517eb4bb33bc',
                        user: '600ac7953ee4670344b0a81f',
                        name: 'Diesel',
                        default: true,
                      },
                      expenseAmount: trip.diesel,
                    });
                  if (trip.fooding > 0)
                    tripExpenses.push({
                      expenseName: {
                        _id: '603bf43da0ab517eb4bb33bd',
                        user: '600ac7953ee4670344b0a81f',
                        name: 'Fooding',
                      },
                      expenseAmount: trip.fooding,
                    });
                  if (trip.labour > 0)
                    tripExpenses.push({
                      expenseName: {
                        _id: '603bf453a0ab517eb4bb33be',
                        user: '600ac7953ee4670344b0a81f',
                        name: 'Labour',
                        default: true,
                      },
                      expenseAmount: trip.labour,
                    });
                  if (trip.di > 0)
                    tripExpenses.push({
                      expenseName: {
                        _id: '603bf463a0ab517eb4bb33bf',
                        user: '600ac7953ee4670344b0a81f',
                        name: 'D.I',
                        default: true,
                      },
                      expenseAmount: trip.di,
                    });
                  if (trip.tolll > 0)
                    tripExpenses.push({
                      expenseName: {
                        _id: '603bf476a0ab517eb4bb33c0',
                        user: '600ac7953ee4670344b0a81f',
                        name: 'Toll',
                        default: true,
                      },
                      expenseAmount: trip.tolll,
                    });
                  if (trip.other > 0)
                    tripExpenses.push({
                      expenseName: {
                        _id: '605a3c023135d4beeae4dde1',
                        user: '600ac7953ee4670344b0a81f',
                        name: 'Other',
                        default: true,
                      },
                      expenseAmount: trip.other,
                    });
                  if (trip.detention > 0)
                    tripExpenses.push({
                      expenseName: {
                        _id: '605a3c173135d4beeae4dde2',
                        user: '600ac7953ee4670344b0a81f',
                        name: 'Detention',
                        default: true,
                      },
                      expenseAmount: trip.detention,
                    });
                }
              });

              tripFields.tripExpenses = tripExpenses;
              //In trip fields, Trip expenses and driver array is missing
              return tripFields;
            })
          );
          Trip.insertMany(tripsArray, async (err, docs) => {
            if (err) {
              console.log(err.message);
            } else {
              docs.map(async (trip) => {
                try {
                  let excelTrips = [...self, ...trading].filter((trips) => {
                    return parseInt(trips.orderNo) === parseInt(trip.orderNo);
                  });

                  let deliveryArray = await Promise.all(
                    excelTrips.map(async (trips) => {
                      let deliveryFields = {};

                      deliveryFields.order = trip.order;
                      deliveryFields.user = req.user.id;
                      deliveryFields.trip = trip._id;

                      if (trips.loading)
                        deliveryFields.loading = {
                          structured_formatting: {
                            main_text: trips.loading,
                          },
                        };

                      if (trips.unloading)
                        deliveryFields.unloading = {
                          structured_formatting: {
                            main_text: trips.unloading,
                          },
                        };
                      console.log(trips);

                      if (trips.lrNo) deliveryFields.lrNo = trips.lrNo;

                      if (trips.billWeight)
                        deliveryFields.billWeight = parseFloat(
                          trips.billWeight
                        );
                      if (trips.unloadingWeight)
                        deliveryFields.unloadingWeight = parseFloat(
                          trips.unloadingWeight
                        );
                      if (trips.weighbridgeName)
                        deliveryFields.weighbridgeName = trips.weighbridgeName;
                      return deliveryFields;
                    })
                  );
                  console.log('/////');
                  Delivery.insertMany(deliveryArray);
                } catch (error) {
                  console.log(error);
                }
              });
            }
          });
        } catch (error) {
          console.log(error.message);
        }
        console.info('%d potatoes were successfully stored.', docs.length);
      }
    });

    res.json('excelTrips');
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/orderbulk/order
// @desc    Patch Deliveries to make Sale Others an array
// @access  Private
router.patch('/order', auth, async (req, res) => {
  // const order = await Order.findOneAndUpdate(
  //   { orderNo: req.params.orderNo },
  //   { customer: party }
  // );

  const deliveries = await Delivery.find({ user: req.user.id }).sort({
    saleDate: -1,
    createdDate: -1,
  });

  for (var i = 0; i < deliveries.length; i++) {
    if (deliveries[i].saleOthers > 0) {
      deliveries[i].saleOthers = [
        {
          expenseDisplay: 'invoice',
          expenseName: 'Others',
          expenseAmount: parseInt(deliveries[i].saleOthers),
        },
      ];
      console.log(deliveries[i]);
      deliveries[i].save();

      // break;
    }
  }

  // "saleOthers" : [
  //       {
  //           "expenseDisplay" : "lorryReceipt",
  //           "expenseName" : "statisticalCharges",
  //           "expenseAmount" : "50"
  //       },
  //       {
  //           "expenseName" : "misc",
  //           "expenseAmount" : "25",
  //           "expenseDisplay" : "lorryReceipt"
  //       }
  //   ],
  res.json(deliveries);
});

router.put('/trips', auth, async (req, res) => {
  // const order = await Order.findOneAndUpdate(
  //   { orderNo: req.params.orderNo },
  //   { customer: party }
  // );

  const trips = await Trip.find({ user: req.user.id });

  trips.map(async (trip) => {
    if (trip.sale.saleOthers && typeof trip.sale.saleOthers === 'string') {
      const deliveries = await Delivery.find({ trip: trip._id });
      deliveries.map(async (delivery) => {
        delivery.saleOthers =
          parseInt(trip.sale.saleOthers) / deliveries.length;
        await delivery.save();
      });
      delete trip.sale.saleOthers;
    }
  });
  res.json(trips);
});

//Generate Whatsapp IDS
router.put('/parties', auth, async (req, res) => {
  const parties = await Party.find({ user: req.user.id });

  parties.map(async (party) => {
    if (party.mobile) {
      // Check Whatsapp Status
      const contact = await getWhatsappId(party.mobile);
      console.log(contact);
      party.waId = contact.wa_id;
    }
    await party.save();
  });
  res.json(parties);
});

//Generate GeoCode Values
router.put('/geocode', async (req, res) => {
  const deliveries = await Delivery.find({});
  let locationArray = locations.filter(
    (thing, index, self) =>
      index === self.findIndex((t) => t.place_id === thing.place_id)
  );
  // console.log(locations);

  await Promise.all(
    // [
    //   deliveries[0],
    //   deliveries[1],
    //   deliveries[2],
    //   deliveries[3],
    //   deliveries[4],
    //   deliveries[5],
    //   deliveries[6],
    //   deliveries[7],
    //   deliveries[8],
    //   deliveries[9],
    // ]
    deliveries.reverse().map(async (delivery) => {
      //Loading
      let geocodeURL = null;
      try {
        if (delivery.loading.structured_formatting.main_text === 'B.BORE') {
          delivery.loading = {
            place_id: 'ChIJf6yzq4WvWTkR1gYjt1gKXLY',
            address_components: [
              'Bamanbor',
              'Rajkot',
              'Gujarat',
              'India',
              '363520',
            ],
            structured_formatting: {
              secondary_text: 'Gujarat, India',
              main_text: 'Bamanbor',
            },
            description: 'Bamanbor, Gujarat, India',
            longitude: 71.0412338,
            latitude: 22.4155343,
          };
          await delivery.save();
        } else {
          let loc = locationArray.find((location) => {
            return (
              location.name.toLowerCase() ===
                delivery.loading.structured_formatting.main_text.toLowerCase() ||
              location.place_id === delivery.loading.place_id
            );
          });

          if (loc) {
            // console.log(loc);
            // delete loc['name'];
            delivery.loading = loc;
            await delivery.save();
          } else {
            if (delivery.loading.place_id) {
              geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${delivery.loading.place_id}&key=AIzaSyDxGCC86EWkjtOccLqVDZKcw-yii2YHcmU`;
            } else {
              geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${delivery.loading.structured_formatting.main_text}&key=AIzaSyDxGCC86EWkjtOccLqVDZKcw-yii2YHcmU`;
            }
          }
        }

        let loadingObj;
        if (geocodeURL) {
          console.log(geocodeURL);

          let response = await axios.get(geocodeURL);
          loadingObj = {
            name: delivery.loading.structured_formatting.main_text,
            place_id: response.data.results[0].place_id,
            address_components: response.data.results[0].address_components.map(
              (add) => {
                return add.long_name;
              }
            ),
            structured_formatting: {
              secondary_text: `${
                response.data.results[0].address_components[
                  response.data.results[0].address_components.length - 3
                ].long_name
              }, ${
                response.data.results[0].address_components[
                  response.data.results[0].address_components.length - 2
                ].long_name
              }`,
              //     ...delivery.loading.structured_formatting.replace(/\w\S*/g, function(txt) {
              // return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
              // }),

              main_text: delivery.loading.structured_formatting.main_text.replace(
                /\w\S*/g,
                function (txt) {
                  return (
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  );
                }
              ),
            },
            description: `${
              response.data.results[0].address_components[0].long_name
            }, ${
              response.data.results[0].address_components[
                response.data.results[0].address_components.length - 3
              ].long_name
            }, ${
              response.data.results[0].address_components[
                response.data.results[0].address_components.length - 2
              ].long_name
            }`,
            longitude: response.data.results[0].geometry.location.lng,
            latitude: response.data.results[0].geometry.location.lat,
          };
          delivery.loading = loadingObj;
          // console.log(locationArray);
          await delivery.save();
          //   }
          // });
          console.log({
            name: delivery.loading.structured_formatting.main_text,
            place_id: delivery.loading.place_id,
            ...loadingObj,
          });
          locationArray.push({
            name: delivery.loading.structured_formatting.main_text.replace(
              /\w\S*/g,
              function (txt) {
                return (
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
              }
            ),
            ...loadingObj,
          });
        }
      } catch (error) {
        console.log(error);
      }
    })
  );
  // console.log(locationArray);
  res.json(
    locationArray.filter(
      (location, index, self) =>
        index === self.findIndex((t) => t.name === location.name)
    )
  );
  // res.json(
  //   locationArray.filter((location, index, self) =>
  //     location.address_components.includes('India')
  //   )
  // );
});

router.put('/geocode/un', async (req, res) => {
  const deliveries = await Delivery.find({});
  let locationArray = locations.filter(
    (thing, index, self) =>
      index === self.findIndex((t) => t.place_id === thing.place_id)
  );
  // console.log(locations);

  await Promise.all(
    // [
    //   deliveries[0],
    //   deliveries[1],
    //   deliveries[2],
    //   deliveries[3],
    //   deliveries[4],
    //   deliveries[5],
    //   deliveries[6],
    //   deliveries[7],
    //   deliveries[8],
    //   deliveries[9],
    // ]
    deliveries.reverse().map(async (delivery) => {
      //Loading
      let geocodeURL = null;
      try {
        if (delivery.unloading.structured_formatting.main_text === 'B.BORE') {
          delivery.unloading = {
            place_id: 'ChIJf6yzq4WvWTkR1gYjt1gKXLY',
            structured_formatting: {
              secondary_text: 'Gujarat, India',
              main_text: 'Bamanbor',
            },
            description: 'Bamanbor, Gujarat, India',
            longitude: 71.0412338,
            latitude: 22.4155343,
          };
          await delivery.save();
        } else {
          let loc = locationArray.find((location) => {
            return (
              location.name.toLowerCase() ===
                delivery.unloading.structured_formatting.main_text.toLowerCase() ||
              location.place_id === delivery.unloading.place_id
            );
          });

          if (loc) {
            // console.log(loc);
            // delete loc['name'];
            delivery.unloading = loc;
            await delivery.save();
          } else {
            if (delivery.unloading.place_id) {
              geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${delivery.unloading.place_id}&key=AIzaSyDxGCC86EWkjtOccLqVDZKcw-yii2YHcmU`;
            } else {
              geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${delivery.unloading.structured_formatting.main_text}&key=AIzaSyDxGCC86EWkjtOccLqVDZKcw-yii2YHcmU`;
            }
          }
        }

        let unloadingObj;
        if (geocodeURL) {
          console.log(geocodeURL);

          let response = await axios.get(geocodeURL);
          unloadingObj = {
            name: delivery.unloading.structured_formatting.main_text,
            place_id: response.data.results[0].place_id,
            address_components: response.data.results[0].address_components.map(
              (add) => {
                return add.long_name;
              }
            ),
            structured_formatting: {
              secondary_text: `${
                response.data.results[0].address_components[
                  response.data.results[0].address_components.length - 3
                ].long_name
              }, ${
                response.data.results[0].address_components[
                  response.data.results[0].address_components.length - 2
                ].long_name
              }`,
              //     ...delivery.unloading.structured_formatting.replace(/\w\S*/g, function(txt) {
              // return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
              // }),

              main_text: delivery.unloading.structured_formatting.main_text.replace(
                /\w\S*/g,
                function (txt) {
                  return (
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  );
                }
              ),
            },
            description: `${
              response.data.results[0].address_components[0].long_name
            }, ${
              response.data.results[0].address_components[
                response.data.results[0].address_components.length - 3
              ].long_name
            }, ${
              response.data.results[0].address_components[
                response.data.results[0].address_components.length - 2
              ].long_name
            }`,
            longitude: response.data.results[0].geometry.location.lng,
            latitude: response.data.results[0].geometry.location.lat,
          };
          delivery.unloading = unloadingObj;
          // console.log(locationArray);
          await delivery.save();
          //   }
          // });
          console.log({
            name: delivery.unloading.structured_formatting.main_text,
            place_id: delivery.unloading.place_id,
            ...unloadingObj,
          });
          locationArray.push({
            name: delivery.unloading.structured_formatting.main_text.replace(
              /\w\S*/g,
              function (txt) {
                return (
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
              }
            ),
            ...unloadingObj,
          });
        }
      } catch (error) {
        console.log(error);
      }
    })
  );
  // console.log(locationArray);
  res.json(
    locationArray.filter(
      (location, index, self) =>
        index === self.findIndex((t) => t.name === location.name)
    )
  );
  // res.json(
  //   locationArray.filter((location, index, self) =>
  //     location.address_components.includes('India')
  //   )
  // );
});

module.exports = router;

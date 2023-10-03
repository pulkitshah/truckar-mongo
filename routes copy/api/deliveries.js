const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");

const Order = require("../../models/Order");
const Trip = require("../../models/Trip");
const Delivery = require("../../models/Delivery");
const Invoice = require("../../models/Invoice");
const Lr = require("../../models/Lr");

const auth = require("../../middlleware/auth");
const getFiscalYear = require("../../utils/getFiscalYear");

const router = express.Router();

// @route   GET api/deliveries/
// @desc    Get Deliveries created by user (Old API)
// @access  Private

router.get("/old", auth, async (req, res) => {
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

    // console.log(orders);
    // console.log(trips);
    // console.log(deliveries);

    if (!orders) {
      res
        .status(400)
        .json({ errors: [{ msg: "There are no orders by this user" }] });
    }
    let response = [];

    response = await Promise.all(
      deliveries.map(async (delivery) => {
        deliveryTrip = trips.filter(
          (trip) => delivery.trip.toString() === trip._id.toString()
        );
        deliveryOrder = orders.filter(
          (order) => delivery.order.toString() === order._id.toString()
        );

        let sumOfBillWeight = 0;
        deliveries
          .filter(
            (deliveryy) =>
              deliveryy.trip.toString() === delivery.trip.toString()
          )
          .map((deliveryy) => {
            if (Boolean(deliveryy.billWeight)) {
              sumOfBillWeight =
                sumOfBillWeight + parseFloat(deliveryy.billWeight);
            }
          });

        if (deliveryOrder.length < 1) {
          await Delivery.deleteOne({
            _id: delivery._id,
          });
        }

        let orderFields = {};
        // SETTING RESPONSE FIELDS
        if (deliveryOrder[0]._id) orderFields._id = deliveryOrder[0]._id;
        orderFields.sumOfBillWeight = sumOfBillWeight;

        if (deliveryOrder[0].orderNo)
          orderFields.orderNo = deliveryOrder[0].orderNo;
        if (deliveryOrder[0].customer)
          orderFields.customer = deliveryOrder[0].customer;
        if (deliveryOrder[0].saleDate)
          orderFields.saleDate = deliveryOrder[0].saleDate;
        if (deliveryOrder[0].createdDate)
          orderFields.createdDate = deliveryOrder[0].createdDate;

        if (deliveryTrip[0]._id) orderFields.tripId = deliveryTrip[0]._id;
        if (deliveryTrip[0].route) orderFields.route = deliveryTrip[0].route;
        if (deliveryTrip[0].vehicle)
          orderFields.vehicle = deliveryTrip[0].vehicle;
        orderFields.isVehicleOwned = deliveryTrip[0].isVehicleOwned;
        if (deliveryTrip[0].type) orderFields.type = deliveryTrip[0].type;
        if (deliveryTrip[0].tripExpenses)
          orderFields.tripExpenses = deliveryTrip[0].tripExpenses;

        if (deliveryTrip[0].vehicleNumber) {
          orderFields.vehicleNumber = deliveryTrip[0].vehicleNumber;
        }

        //Create Sale Details
        if (deliveryTrip[0].sale) orderFields.sale = deliveryTrip[0].sale;

        // When isVehicleOwned = false, Create Purchase Details
        if (!orderFields.isVehicleOwned) {
          if (deliveryTrip[0].purchase)
            orderFields.purchase = deliveryTrip[0].purchase;
        } else {
          if (deliveryTrip[0].driver)
            orderFields.driver = deliveryTrip[0].driver;
        }
        if (delivery._id) orderFields.deliveryId = delivery._id;
        if (delivery.billWeight) orderFields.billWeight = delivery.billWeight;
        if (delivery.unloadingWeight)
          orderFields.unloadingWeight = delivery.unloadingWeight;
        if (delivery.loading)
          orderFields.loading =
            delivery.loading.structured_formatting.main_text;
        if (delivery.unloading)
          orderFields.unloading =
            delivery.unloading.structured_formatting.main_text;

        // console.log(orderFields);

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

// @route   GET api/deliveries/
// @desc    Get Deliveries created by user
// @access  Private

router.get("/", auth, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const deliveries = await Delivery.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "orders",
          let: {
            id: "$order",
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
                orderNo: 1,
                _id: 1,
                saleDate: 1,
                customer: 1,
                createdDate: 1,
              },
            },
            {
              $lookup: {
                from: "parties",
                let: {
                  id: "$customer",
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
                as: "customer",
              },
            },
            {
              $unwind: {
                path: "$customer",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "orderDetails",
        },
      },
      { $unwind: "$orderDetails" },
      {
        $lookup: {
          from: "trips",
          let: {
            id: "$trip",
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
                as: "transporter",
              },
            },
            {
              $unwind: {
                path: "$transporter",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "vehicles",
                let: {
                  id: "$vehicle",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$id"] },
                    },
                  },
                  {
                    $lookup: {
                      from: "organisations",
                      let: {
                        id: "$organisation",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: { $eq: ["$_id", "$$id"] },
                          },
                        },
                      ],
                      as: "owner",
                    },
                  },
                  {
                    $unwind: {
                      path: "$owner",
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: "vehicle",
              },
            },
            {
              $unwind: {
                path: "$vehicle",
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
          ],
          as: "trips",
        },
      },
      { $unwind: "$trips" },
      {
        $lookup: {
          from: "lrs",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$delivery", "$$id"] },
              },
            },
            {
              $lookup: {
                from: "organisations",
                let: {
                  id: "$organisation",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$id"] },
                    },
                  },
                ],
                as: "organisation",
              },
            },
            {
              $unwind: {
                path: "$organisation",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "lr",
        },
      },
      {
        $unwind: {
          path: "$lr",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          orderNo: "$orderDetails.orderNo",
          saleDate: "$orderDetails.saleDate",
          createdDate: "$orderDetails.createdDate",
          transporter: "$trips.transporter",
          driver: "$trips.driver",
          driverMobile: "$trips.driverMobile",
          driverArrivalTime: "$trips.driverArrivalTime",
          tripExpenses: "$trips.tripExpenses",
          vehicleNumber: "$trips.vehicleNumber",
          owner: "$trips.vehicle.owner",
          loadingDate: "$trips.loadingDate",
          customer: "$orderDetails.customer",
          loading: "$loading.structured_formatting.main_text",
          loadingPlaceId: "$loading.place_id",
          loadingLat: "$loading.latitude",
          loadingLong: "$loading.longitude",
          unloading: "$unloading.structured_formatting.main_text",
          unloadingPlaceId: "$unloading.place_id",
          unloadingLatitudeId: "$luoading.latitude",
          unloadingLat: "$unloading.latitude",
          unloadingLong: "$unloading.longitude",

          //Sale Fields
          saleRate: "$trips.sale.saleRate",
          saleType: "$trips.sale.saleType",
          saleMinimumQuantity: "$trips.sale.saleMinimumQuantity",
          saleOthers: 1,
          saleAdvance: "$trips.sale.saleAdvance",
          saleBillNo: "$trips.sale.saleBillNo",

          //Purchase Fields
          purchaseRate: "$trips.purchase.purchaseRate",
          purchaseType: "$trips.purchase.purchaseType",
          commissionType: "$trips.purchase.commissionType",
          purchaseMinimumQuantity: "$trips.purchase.purchaseMinimumQuantity",
          purchaseRemarks: "$trips.purchase.purchaseRemarks",
          purchaseOthers: 1,
          purchaseAdvance: "$trips.purchase.purchaseAdvance",
          purchaseBillNo: "$trips.purchase.purchaseBillNo",

          lrNo: "$lr.lrNo",
          lrId: "$lr._id",
          lrOrganisation: "$lr.organisation",
          lrVehicleType: "$lr.vehicleType",

          billWeight: 1,
          unloadingWeight: 1,
          weighbridgeName: 1,
          status: 1,
          order: 1,
          trip: 1,
        },
      },
      { $sort: { saleDate: -1, createdDate: -1 } },
      // { $limit: startIndex + limit },
      // { $skip: startIndex },
    ]);
    res.json(deliveries);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/deliveries/:DeliveryID
// @desc    Get delivery by DeliveryID created by user
// @access  Private

router.get("/:id", auth, async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      user: req.user.id,
      _id: req.params.id,
    });

    if (!delivery) {
      res
        .status(400)
        .json({ errors: [{ msg: "There are no orders by this user" }] });
    }

    // console.log(response[0]);
    res.json(delivery);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   Patch api/orders/deliveries/:TripId
// @desc    Update Bill Weight and unoading Weight
// @access  Private

router.patch("/:deliveryId", auth, async (req, res) => {
  // const updates = Object.keys(req.body);

  const updates = Object.keys(req.body);

  try {
    const delivery = await Delivery.findOne({
      _id: req.params.deliveryId,
      user: req.user.id,
    });

    if (!delivery) {
      return res.status(404).send("No Delivery to update");
    }

    updates.forEach((update) => (delivery[update] = req.body[update]));
    await delivery.save();

    res.send(delivery);
  } catch (error) {
    res.status(400).send(error);
  }
});

// @route   DELETE api/deliveries/:DeliveryId
// @desc    DELETE Deliveries by ID
// @access  Private

router.delete("/:id", auth, async (req, res) => {
  // const updates = Object.keys(req.body);

  try {
    //check if LR exists
    const lr = await Lr.findOne({
      delivery: req.params.id,
      user: req.user.id,
    });

    if (lr) {
      return res
        .status(202)
        .send(
          "Cannot delete delivery after LR is issued. Please cancel the LR"
        );
    }

    const invoice = await Invoice.findOne({
      deliveryIds: {
        $in: [mongoose.Types.ObjectId(req.params.id)],
      },
    });
    if (invoice) {
      return res
        .status(202)
        .send(
          `Cannot delete delivery. Please delete it from invoice ${invoice.invoiceNo} `
        );
    }
    const delivery = await Delivery.deleteOne({
      user: req.user.id,
      _id: req.params.id,
    });

    if (!delivery) {
      return res.status(404).send("No Delivery to delete. Recheck Id");
    }

    return res.send(delivery);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

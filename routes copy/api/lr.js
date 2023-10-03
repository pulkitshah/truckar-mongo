const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");
const Delivery = require("../../models/Delivery");
const Lr = require("../../models/Lr");

const auth = require("../../middlleware/auth");
const getFiscalYear = require("../../utils/getFiscalYear");

const router = express.Router();

// @route   post api/lr/:DeliveryId
// @desc    Update LrNo and LR Details in the delivery
// @access  Private

router.post("/:id", auth, async (req, res) => {
  // const updates = Object.keys(req.body);
  try {
    let delivery;
    delivery = await Delivery.findOne({
      user: req.user.id,
      _id: req.params.id,
    });

    var checkLrDelivery = await Lr.findOne({
      user: req.user.id,
      delivery: req.params.id,
    });

    if (checkLrDelivery) {
      return res.status(400).send("Lr already exists for this delivery");
    }

    var checkLr = await Lr.findOne({
      user: req.user.id,
      organisation: req.body.organisation,
      lrNo: req.body.lrNo,
    });

    if (checkLr) {
      return res.status(400).send("Lr already exists with the LR no");
    }

    var results = await Lr.find({
      user: req.user.id,
      organisation: req.body.organisation,
      date: {
        $lte: getFiscalYear(req.body.date).current.end,
        $gte: getFiscalYear(req.body.date).current.start,
      },
    });

    let lrFields = {};
    lrFields.user = req.user.id;

    if (delivery) lrFields.delivery = req.params.id;
    if (delivery) lrFields.trip = delivery.trip;
    if (delivery) lrFields.order = delivery.order;
    if (req.body.lrNo) {
      lrFields.lrNo = req.body.lrNo;
    } else {
      lrFields.lrNo = `${req.body.organisation.initials} - ${
        results.length + 1
      }`;
    }
    if (req.body.lrDate)
      lrFields.date = moment(req.body.lrDate).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
    if (req.body.consignor) lrFields.consignor = req.body.consignor;
    if (req.body.consignee) lrFields.consignee = req.body.consignee;
    if (req.body.vehicleNumber) lrFields.vehicleNumber = req.body.vehicleNumber;
    if (req.body.loading) lrFields.loading = req.body.loading;
    if (req.body.unloading) lrFields.unloading = req.body.unloading;
    if (req.body.natureOfGoods) lrFields.natureOfGoods = req.body.natureOfGoods;
    if (req.body.lrWeight) lrFields.lrWeight = req.body.lrWeight;
    if (req.body.lrRate) lrFields.lrRate = req.body.lrRate;
    if (req.body.organisation) lrFields.organisation = req.body.organisation;

    lr = new Lr(lrFields);
    await lr.save();
    await lr.populate("organisation");

    if (!delivery) {
      return res.status(404).send("No Trips to update");
    }

    res.send(lr);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// @route   Patch api/lr/:DeliveryId
// @desc    Patch LrNo and LR Details in the delivery
// @access  Private

router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    let lr = await Lr.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    var results = await Lr.find({
      user: req.user.id,
      organisation: req.body.organisation,
      date: {
        $lte: getFiscalYear(req.body.date).current.end,
        $gte: getFiscalYear(req.body.date).current.start,
      },
    });

    if (!lr) {
      return res.status(404).send("No lr to update");
    }

    updates.forEach((update) => (lr[update] = req.body[update]));
    if (req.body.lrNo) {
      lr.lrNo = req.body.lrNo;
    } else if (req.body.organisation) {
      lr.lrNo = `${req.body.organisation.initials} - ${results.length + 1}`;
    }
    await lr.save();
    res.send(lr);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// @route   Patch api/lr/:DeliveryId
// @desc    Update LR via public link
// @access  Public

router.patch("/lrpubic/:id", async (req, res) => {
  const updates = Object.keys(req.body);

  try {
    let lr = await Lr.findOne({
      _id: req.params.id,
    });

    if (!lr) {
      return res.status(404).send("No lr to update");
    }

    updates.forEach((update) => (lr[update] = req.body[update]));
    console.log(lr);
    await lr.save();
    let updatedLR = await Lr.findOne({
      _id: req.params.id,
    })
      .populate("organisation")
      .populate("trip")
      .populate("order")
      .populate("delivery")
      .populate("consignor")
      .populate("consignee")
      .populate("user");

    res.send(updatedLR);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// @route   post api/lrs/lrnumber/:orgId
// @desc    Get Lr No. of Organisation for a fiscal year
// @access  Private

router.post("/lrnumber/:orgId", auth, async (req, res) => {
  // const updates = Object.keys(req.body);
  try {
    var organisation = await Organisation.findOne({
      user: req.user.id,
      _id: req.params.orgId,
    });

    var fiscalYear = `${getFiscalYear(req.body.lrDate).current.start.format(
      "YYYY"
    )}-${getFiscalYear(req.body.lrDate).current.end.format("YYYY")}`;

    var results = await Lr.find({
      user: req.user.id,
      organisation: req.params.orgId,
      date: {
        $lte: getFiscalYear(req.body.lrDate).current.end,
        $gte: getFiscalYear(req.body.lrDate).current.start,
      },
    });

    var lrCount = results.length + 1;

    organisation.counter.map((counter) => {
      if (fiscalYear === counter.fiscalYear && "lr" === counter.counterType) {
        lrCount = lrCount + parseInt(counter.count);
      }
    });
    // res.send(results);

    res.send(`${lrCount}`);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// @route   post api/lrs/lrnumber/:orgId
// @desc    Get Lr No. of Organisation for a fiscal year
// @access  Private

router.post("/validatelrnumber/:orgId", auth, async (req, res) => {
  // const updates = Object.keys(req.body);
  try {
    var organisation = await Organisation.findOne({
      user: req.user.id,
      _id: req.params.orgId,
    });

    var results = await Lr.findOne({
      user: req.user.id,
      organisation: req.params.orgId,
      lrNo: req.body.lrNo,
    });

    if (results) {
      res.status(200).send("Lr No already exists.");
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// @route   GET api/lrs/delivery/:DeliveryId
// @desc    Send Delivery Id to get LR made for the delivery
// @access  Private

router.get("/delivery/:id", auth, async (req, res) => {
  try {
    lr = await Lr.findOne({
      delivery: req.params.id,
      user: req.user.id,
    })
      .populate("organisation")
      .populate("trip")
      .populate("order")
      .populate("delivery");

    if (!lr) {
      return res.status(202).send("Lr not made for delivery");
    }
    await lr.populate("user");
    res.status(200).send(lr);
  } catch (error) {
    console.log(error);
    res.status(400).send("Recheck Id");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const lrs = await Lr.aggregate([
      {
        $match: {
          delivery: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      { $sort: { date: -1, lrNo: -1 } },
      {
        $lookup: {
          from: "partyaddresses",
          let: {
            id: "$consignor",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
              },
            },
          ],
          as: "consignor",
        },
      },
      {
        $unwind: {
          path: "$consignor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "partyaddresses",
          let: {
            id: "$consignee",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
              },
            },
          ],
          as: "consignee",
        },
      },
      {
        $unwind: {
          path: "$consignee",
          preserveNullAndEmptyArrays: true,
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
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
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
      {
        $lookup: {
          from: "deliveries",
          let: {
            id: "$delivery",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
              },
            },
          ],
          as: "delivery",
        },
      },
      {
        $unwind: {
          path: "$delivery",
          preserveNullAndEmptyArrays: true,
        },
      },
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
          ],
          as: "trip",
        },
      },
      {
        $unwind: {
          path: "$trip",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            id: "$user",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
              },
            },
          ],
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
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
          as: "order",
        },
      },
      {
        $unwind: {
          path: "$order",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          natureOfGoods: 1,
          noOfItems: 1,
          valueOfGoods: 1,
          fareBasis: 1,
          dimesnionsLength: 1,
          dimesnionsBreadth: 1,
          dimesnionsHeight: 1,
          packagingType: 1,
          gstPayableBy: 1,
          loading: 1,
          unloading: 1,
          lrRate: 1,
          lrNo: 1,
          date: 1,
          unloadingWeight: 1,
          weighbridgeName: 1,
          status: 1,
          order: 1,
          trip: 1,
          delivery: 1,
          organisation: 1,
          consignor: 1,
          consignee: 1,
          vehicleNumber: 1,
          user: 1,
          insuranceCompany: 1,
          insuranceDate: 1,
          insurancePolicyNo: 1,
          insuranceAmount: 1,
          vehicleType: 1,
          ewayBillNo: 1,
          ewayBillExpiryDate: 1,
        },
      },
    ]);
    res.json(lrs);
  } catch (error) {
    console.log(error);
    res.status(400).send("Recheck Id");
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const lrs = await Lr.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(req.user.id) },
      },
      { $sort: { date: -1, lrNo: -1 } },
      {
        $lookup: {
          from: "partyaddresses",
          let: {
            id: "$consignor",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
              },
            },
          ],
          as: "consignor",
        },
      },
      {
        $unwind: {
          path: "$consignor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "partyaddresses",
          let: {
            id: "$consignee",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
              },
            },
          ],
          as: "consignee",
        },
      },
      {
        $unwind: {
          path: "$consignee",
          preserveNullAndEmptyArrays: true,
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
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
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

      {
        $project: {
          natureOfGoods: 1,
          noOfItems: 1,
          valueOfGoods: 1,
          loading: 1,
          unloading: 1,
          lrNo: 1,
          date: 1,
          unloadingWeight: 1,
          weighbridgeName: 1,
          status: 1,
          order: 1,
          trip: 1,
          delivery: 1,
          fareBasis: 1,
          dimesnionsLength: 1,
          dimesnionsBreadth: 1,
          dimesnionsHeight: 1,
          packagingType: 1,
          gstPayableBy: 1,
          insuranceCompany: 1,
          insuranceDate: 1,
          insurancePolicyNo: 1,
          insuranceAmount: 1,
          ewayBillNo: 1,
          ewayBillExpiryDate: 1,
          vehicleType: 1,
          organisation: 1,
          // lrWeight: '$deliveryDetails.billWeight',
          // orderNo: '$orderDetails.orderNo',
          // customerName: '$orderDetails.customer.name',
          // customerId: '$orderDetails.customer._id',
          organisationName: "$organisation.name",
          organisationId: "$organisation._id",
          organisationInitials: "$organisation.initials",
          consignor: 1,
          consignee: 1,
        },
      },
    ]);
    res.json(lrs);
  } catch (error) {
    console.log(error);
    res.status(400).send("Recheck Id");
  }
});
module.exports = router;

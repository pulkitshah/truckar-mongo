const mongoose = require("mongoose");

deliverySchema = new mongoose.Schema({
  billQuantity: {
    type: Number,
  },
  unloadingQuantity: {
    type: Number,
  },
  loading: {
    type: Object,
  },
  unloading: {
    type: Object,
  },
  weighbridgeName: {
    type: String,
  },

  remarks: {
    type: String,
  },
  status: {
    type: String,
  },

  lr: {
    lrFormat: { type: String },
    lrNo: {
      type: Number,
    },
    lrDate: {
      type: Date,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "delivery",
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organisation",
    },
    consignor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
    },
    consignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
    },

    descriptionOfGoods: {
      type: Object,
    },
    dimesnionsLength: { type: String },
    dimesnionsBreadth: { type: String },
    dimesnionsHeight: { type: String },
    fareBasis: { type: String },
    valueOfGoods: { type: String },
    chargedWeight: { type: String },
    insuranceCompany: { type: String },
    insuranceDate: { type: String },
    insurancePolicyNo: { type: String },
    insuranceAmount: { type: String },
    ewayBillNo: { type: String },
    ewayBillExpiryDate: { type: String },
    gstPayableBy: { type: String },
    vehicleNumber: { type: String },
    loading: { type: String },
    unloading: { type: String },
    natureOfGoods: { type: String },
    lrWeight: { type: String },
    lrRate: { type: String },
    noOfItems: { type: String },
    packagingType: { type: String },
    lrCharges: {
      type: Object,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
    },
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
  },

  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

deliverySchema.get(function () {
  return this._id.toHexString();
});

deliverySchema.set("toJSON", {
  virtuals: true,
});

const Delivery = mongoose.model("delivery", deliverySchema);

module.exports = Delivery;

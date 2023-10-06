const mongoose = require("mongoose");

lrSchema = new mongoose.Schema({
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
});

lrSchema.get(function () {
  return this._id.toHexString();
});

lrSchema.set("toJSON", {
  virtuals: true,
});

const Lr = mongoose.model("lr", lrSchema);

module.exports = Lr;

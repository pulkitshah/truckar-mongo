const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const addressSchema = new Schema({
  name: {
    type: String,
    max: 100,
  },
  gstin: {
    type: String,
  },
  pan: {
    type: String,
  },
  billingAddressLine1: {
    type: String,
  },
  billingAddressLine2: {
    type: String,
  },
  city: {
    type: Object,
  },
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "party",
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

addressSchema.get(function () {
  return this._id.toHexString();
});

addressSchema.set("toJSON", {
  virtuals: true,
});

Address = mongoose.model("address", addressSchema);

module.exports = Address;

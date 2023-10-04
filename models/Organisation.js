const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const organisationSchema = new Schema({
  name: {
    type: String,
    max: 100,
  },
  initials: {
    type: String,
  },
  addressLine1: {
    type: String,
  },
  addressLine2: {
    type: String,
  },
  city: {
    type: String,
  },
  pincode: {
    type: String,
  },
  contact: {
    type: String,
  },
  email: {
    type: String,
  },
  gstin: {
    type: String,
  },
  pan: {
    type: String,
  },
  invoiceTermsAndConditions: {
    type: String,
  },
  lrTermsAndConditions: {
    type: String,
  },
  bankAccountNumber: {
    type: String,
  },
  bankName: {
    type: String,
  },
  bankBranchName: {
    type: String,
  },
  bankIFSC: {
    type: String,
  },
  logo: {
    type: String,
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

organisationSchema.get(function () {
  return this._id.toHexString();
});

organisationSchema.set("toJSON", {
  virtuals: true,
});

Organisation = mongoose.model("organisation", organisationSchema);

module.exports = Organisation;

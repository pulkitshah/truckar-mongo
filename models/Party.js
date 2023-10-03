const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const partySchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  name: {
    type: String,
    max: 100,
  },
  city: {
    type: Object,
  },
  mobile: {
    type: String,
  },
  waId: {
    type: String,
    required: false,
  },
  isTransporter: {
    type: Boolean,
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

partySchema.get(function () {
  return this._id.toHexString();
});

partySchema.set("toJSON", {
  virtuals: true,
});

Party = mongoose.model("party", partySchema);

module.exports = Party;

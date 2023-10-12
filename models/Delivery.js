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
  particular: {
    type: Array,
  },

  invoiceCharges: {
    type: Array,
  },

  lr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "lr",
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
  },

  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "invoice",
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

const mongoose = require("mongoose");

invoiceSchema = new mongoose.Schema({
  invoiceFormat: { type: String },
  invoiceNo: {
    type: Number,
  },
  invoiceDate: {
    type: Date,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
  },
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organisation",
  },
  billingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "address",
  },
  deliveries: [
    {
      delivery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "delivery",
      },
      invoiceCharges: {
        type: Array,
      },
      particular: {
        type: Array,
      },
    },
  ],
  taxes: {
    type: Object,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
  },
});

invoiceSchema.get(function () {
  return this._id.toHexString();
});

invoiceSchema.set("toJSON", {
  virtuals: true,
});

const Invoice = mongoose.model("invoice", invoiceSchema);

module.exports = Invoice;

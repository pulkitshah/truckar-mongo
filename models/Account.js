const mongoose = require("mongoose");
const validator = require("validator");

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  orderExpensesSettings: {
    type: Array,
  },
  lrSettings: {
    type: Array,
  },
  taxOptions: {
    type: Array,
  },
  lrFormat: {
    type: String,
  },
  invoiceFormat: {
    type: String,
  },
});

accountSchema.get(function () {
  return this._id.toHexString();
});

accountSchema.set("toJSON", {
  virtuals: true,
});

const Account = mongoose.model("account", accountSchema);

module.exports = Account;

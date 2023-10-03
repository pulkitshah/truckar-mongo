const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  accounts: [
    {
      account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
      },
      role: {
        type: String,
        required: false,
      },
    },
  ],

  mobile: {
    type: String,
    required: false,
  },

  onBoardingRequired: {
    type: Boolean,
    required: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    require: true,
    minlength: 6,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error('Password cannot contain "password"');
      }
    },
  },
});

userSchema.get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

const User = mongoose.model("user", userSchema);

module.exports = User;

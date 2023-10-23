const mongoose = require("mongoose");
// const config = require('config');

// const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.NODE_ENV !== "production"
        ? process.env.mongoURI_LOCAL.toString()
        : process.env.mongoURI_DEV.toString(),
      // process.env.mongoURI_PROD.toString(),
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Mongo DB Connected");
  } catch (error) {
    console.log(error.message);

    //Exit Process with Failure
    process.exit(1);
  }
};

module.exports = connectDB;

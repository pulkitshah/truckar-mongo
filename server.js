const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const app = express();
var cors = require("cors");
require("dotenv").config();

//Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define Routes
app.use("/api/address", require("./routes/api/address"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/account", require("./routes/api/account"));
app.use("/api/delivery", require("./routes/api/delivery"));
app.use("/api/driver", require("./routes/api/driver"));
app.use("/api/lr", require("./routes/api/lr"));
app.use("/api/order", require("./routes/api/order"));
app.use("/api/organisation", require("./routes/api/organisation"));
app.use("/api/party", require("./routes/api/party"));
app.use("/api/vehicle", require("./routes/api/vehicle"));

//Serve static assets in production
if (process.env.NODE_ENV === "production") {
  //set static folder
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));

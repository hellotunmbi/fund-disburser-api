const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const expressValidator = require("express-validator");

require("dotenv").config({ path: "variables.env" });

const app = express();

// Configure routes...
const user = require("./routes/user.route");
const feature = require("./routes/feature.route");
const vendor = require("./routes/vendor.route");
const payment = require("./routes/payment.route");

// Connect to MongoDB...
// const dev_db_url = 'mongodb://localhost:27017/dearmacdb';
let mongoDB = process.env.MONGODB_URL; // || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connection.on(
  "error",
  console.error.bind(console, "MongoDB Connection Error...")
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(expressValidator());

// ROUTES...
app.get("/", (req, res) => {
  res.json("Welcome to Home of Fund Disburser");
});
app.use("/user", user);
app.use("/feature", feature);
app.use("/vendor", vendor);
app.use("/payment", payment);

// Import all models
require("./models/User");

let port = 1000;

app.listen(process.env.PORT || port, () => {
  console.log(`Server now up and running on port ${port}`);
});

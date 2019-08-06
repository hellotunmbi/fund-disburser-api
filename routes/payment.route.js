const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");

require("dotenv").config({ path: "variables.env" });

// GET SINGLE VENDOR...
router.post("/fund", paymentController.fundAccount);

// router.post("/", vendorController.addVendor);

module.exports = router;

const express = require("express");
const router = express.Router();

const vendorController = require("../controllers/vendor.controller");

require("dotenv").config({ path: "variables.env" });

// GET SINGLE VENDOR...
router.get("/", vendorController.allVendors);

router.post("/", vendorController.addVendor);

module.exports = router;

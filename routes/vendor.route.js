const express = require("express");
const router = express.Router();

const vendorController = require("../controllers/vendor.controller");

// GET SINGLE VENDOR...
router.get("/", vendorController.allVendors);

router.post("/", vendorController.addVendor);

module.exports = router;

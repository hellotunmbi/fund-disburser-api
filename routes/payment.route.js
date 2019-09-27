const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");

// GET SINGLE VENDOR...
router.post("/fund", paymentController.fundAccount);

router.get("/confirmpayment/:ref", paymentController.confirmTransaction);

module.exports = router;

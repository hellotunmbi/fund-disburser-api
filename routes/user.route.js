const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

require("dotenv").config({ path: "variables.env" });
// Configure Cloudinary storage...
// Test URL
router.get("/", (req, res) => {
  res.send("Welcome to User Controller");
});

// GET SINGLE USER...
router.get("/:id", userController.getSingleUser);

// UPDATE USER DETAILS...
router.patch("/:id", userController.updateSingleUser);

// GET USER LOCATION...
router.get("/:id/location", userController.getUserLocation);

// GET USER MATCHES...
router.get("/:id/matches", userController.getUserMatches);

// GET USER FEATURES...
router.get("/:user_id/features", userController.getFeaturesByUser);

// router.get('/logout', authController.logout);

module.exports = router;

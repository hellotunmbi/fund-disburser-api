const express = require("express");
const router = express.Router();

require("dotenv").config({ path: "variables.env" });

const featureController = require("../controllers/feature.controller");

// CREATE A NEW FEATURE...
router.post("/", featureController.createFeature);

// GET SINGLE FEATURE...
router.get("/:id", featureController.getSingleFeature);

// GET FEATURES BY SEX...
// body: plan - user's plan
router.get("/:sex/sex/:plan_id", featureController.getFeatureByOppositeSex);

// LIKE A FEATURE...
// param: id - feature ID
router.patch("/:id/like", featureController.likeFeature);

// CONNECT TO A FEATURE...
// param: id - feature ID
router.patch("/:id/connect", featureController.connectFeature);

module.exports = router;

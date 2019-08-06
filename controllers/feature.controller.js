const Feature = require("../models/Feature");
const User = require("../models/User");
const Plans = require("../models/Plans");

// CREATE NEW FEATURE
exports.createFeature = async function(req, res) {
  const {
    owner_id,
    sex,
    state,
    city,
    age_range,
    hangout_location,
    hangout_date_time,
    turn_ons,
    turn_offs,
    other_info,
    feature_pic,
    feature_public_id,
    plan_id
  } = req.body;
  const status = "activated";
  const feature = Feature({
    owner_id,
    sex,
    state,
    city,
    age_range,
    hangout_location,
    hangout_date_time,
    turn_ons,
    turn_offs,
    other_info,
    feature_pic,
    feature_public_id,
    status,
    plan_id
  });

  const nowDate = new Date();
  //Get the plan details from plan_id and append to feature object...
  Plans.findById(plan_id).exec(function(error, foundPlan) {
    const expiry_date = nowDate.setMonth(
      nowDate.getMonth() + Number(foundPlan.duration)
    );
    feature.expires_at = new Date(expiry_date);
    feature.plan_name = foundPlan.plan_name;

    feature.save(function(err) {
      if (err) {
        res.json({
          status: 400,
          data: {
            message: "An Error Occured: " + err
          }
        });
      } else {
        res.json({
          status: 200,
          data: {
            message: "Feature created successfully. Awaiting Approval"
          }
        });
      }
    });
  });
};

exports.postImage = (req, res) => {
  console.log(req.file);

  res.json({
    image_url: req.file.url,
    public_id: req.file.public_id
  });
};

exports.getSingleFeature = (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.json({ status: 400, message: "Feature ID Invalid" });
  } else {
    Feature.findById(id, function(err, feature) {
      if (err) {
        res.json({
          status: 400,
          message: "Feature not found: " + err
        });
      } else {
        res.json({
          status: 200,
          feature
        });
      }
    });
  }
};

// GET FEATURE BY SEX...
// Params: sex, plan_id
exports.getFeatureByOppositeSex = (req, res) => {
  const { sex, plan_id } = req.params;
  const sexSwap = {
    male: "guy",
    female: "lady"
  };

  if (!sex) {
    res.json({ status: 400, message: "Error: Sex not specified" });
  } else {
    const nowDate = new Date();
    Plans.findById(plan_id).exec(function(error, foundPlan) {
      Feature.find({
        sex: sexSwap[sex],
        status: "activated",
        expires_at: { $gt: nowDate },
        plan_name: { $in: foundPlan.connect_categories }
      })
        .populate("owner_id")
        .sort({ updated_at: "desc" })
        .exec(function(err, details) {
          if (err) {
            res.json({
              status: 400,
              message: "No Feature found: " + err
            });
          } else {
            res.json({
              status: 200,
              details
            });
          }
        });
    });
  }
};

// UPDATE SINGLE USER
exports.updateSingleUser = (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.json({ status: 400, message: "User ID Invalid" });
  } else {
    User.findByIdAndUpdate(id, { $set: req.body }, function(err, user) {
      if (err) {
        res.json({
          status: 404,
          message: "User not found"
        });
      } else {
        res.json({
          status: 200,
          data: {
            message: "User profile updated successfully"
          }
        });
      }
    });
  }
};

// LIKE A FEATURE...
exports.likeFeature = (req, res) => {
  const id = req.params.id;
  const liked_by = req.body.liked_by;

  const currentDate = new Date();
  const newLike = { liked_by: liked_by, date_liked: currentDate };

  if (!id || !liked_by) {
    res.json({ status: 400, message: "Feature id or liked_by Not Set" });
  } else {
    Feature.findByIdAndUpdate(id, { $push: { likes: newLike } }, function(
      err,
      feature
    ) {
      if (err) {
        res.json({
          status: 404,
          message: "Feature not found: " + err
        });
      } else {
        res.json({
          status: 200,
          data: {
            message: "Feature Liked Successfully"
          }
        });
      }
    });
  }
};

// CONNECT A FEATURE...
exports.connectFeature = (req, res) => {
  const id = req.params.id;
  const connected_by = req.body.connected_by;

  const currentDate = new Date();
  const newConnect = {
    connected_by: connected_by,
    date_connected: currentDate
  };

  if (!id || !connected_by) {
    res.json({ status: 400, message: "Feature id or liked_by Not Set" });
  } else {
    Feature.findByIdAndUpdate(id, { $push: { connects: newConnect } }, function(
      err,
      feature
    ) {
      if (err) {
        res.json({
          status: 404,
          message: "Feature not found: " + err
        });
      } else {
        res.json({
          status: 200,
          data: {
            message: "Successfully Connected to User's Feature"
          }
        });
      }
    });
  }
};

// ACCEPT A FEATURE...
// Add match object to the feature and change feature status to 'accepted'
exports.acceptConnect = (req, res) => {
  const feature_id = req.params.id;
  const matched_to = req.body.matched_to;
  const owner_id = req.body.owner_id;

  const gender = {
    male: {
      obj: "him",
      ref: "his",
      pronoun: "he"
    },
    female: {
      obj: "her",
      ref: "her",
      pronoun: "she"
    }
  };

  const currentDate = new Date();
  const newMatchConnector = {
    matched_to: matched_to,
    isMyFeature: true,
    date_matched: currentDate
  };
  const newMatchRecipient = {
    matched_to: owner_id,
    isMyFeature: false,
    date_matched: currentDate
  };

  // Get users details and his plan
  User.findById(owner_id)
    .populate("plan_id")
    .exec(async function(error, user) {
      // Check if plan threshold is greater than user's matched_total
      if (user) {
        // If Yes
        if (user["plan_id"].threshold >= user["matched_total"]) {
          try {
            // Push newMatchConnector to user's match object
            const userResult = await User.findByIdAndUpdate(owner_id, {
              $push: { match: newMatchConnector },
              $inc: { matched_total: 1 }
            });

            // Push newMatchRecipient to connector match object
            const matchResult = await User.findByIdAndUpdate(matched_to, {
              $push: { match: newMatchRecipient }
            });

            // Increase matched_count of feature AND remove matched_to user from user's feature matches
            const featureCount = await Feature.findByIdAndUpdate(feature_id, {
              $inc: { matched_count: 1 },
              $pull: { connects: { connected_by: matchResult["_id"] } }
            });

            // send email to matched_to
            const { first_name, email } = matchResult;
            const owner_name = userResult.first_name;
            const owner_sex = userResult.gender;
            const subject = "Hey! You have a match";
            const message = `
							Hello ${first_name},<br/><br/>
							${owner_name} just matched with you on a feature ${
              gender[owner_sex].pronoun
            } posted.<br/><br/>
							Your details has been shared with ${gender[owner_sex].obj}<br/><br/>
							You can also check out ${
                gender[owner_sex].ref
              } profile on the Matches section of the DearMac app.<br/><br/>
							Have fun!<br/><br/>
						`;

            res.json({
              status: 200,
              data: {
                message: "Accepted Successfully. <br/>You Have A Match"
              }
            });
          } catch (e) {
            res.json({
              status: 400,
              error: e,
              message: "Error FOUND!"
            });
          }
        } else {
          res.json({
            status: 400,
            message:
              "You have exceeded your total number of matches. <br/>Contact Admin for upgrade"
          });
        }
      } else {
        res.json({
          status: 400,
          message: "Unable to match with user at the moment."
        });
      }
    });
  // If No, return error msg that you've exhausted your quota. Call admin to upgrade
};

exports.getUserMatches = (req, res) => {
  const user_id = req.params.user_id;

  User.findById(user_id)
    .select("match matched_total")
    .exec(function(err, user) {
      if (err) {
        res.json({
          status: 400,
          message: "Unable to find your matches"
        });
      }
      if (!user) {
        res.json({
          status: 404,
          message: "You dont have any match yet"
        });
      } else {
        // Collate only IDs of matches in an array...
        let matchesArray = user.match.map(
          singleMatch => singleMatch.matched_to
        );

        User.find({
          _id: { $in: matchesArray }
        })
          .select("-match")
          .sort({ _id: "desc" })
          .exec((error, matchedUsers) => {
            if (error) {
              res.json({
                status: 400,
                message: "Unable to find all your matches"
              });
            }
            res.json({
              status: 200,
              data: {
                message: "Matches Found",
                matches: matchedUsers
              }
            });
          });

        // res.json({
        // 	status: 200,
        // 	matches: matchesArray,
        // });
      }
    });
};

exports.updateFeature = (req, res) => {};

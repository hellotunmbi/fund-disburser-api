const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const validator = require("validator");

const userSchema = new Schema({
  first_name: {
    type: String,
    trim: true,
    required: true,
    max: 100
  },
  last_name: {
    type: String,
    trim: true,
    required: true
  },
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: true
  },
  dob: {
    type: String,
    trim: true,
    required: true
  },
  phone: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Invalid Email Address"]
  },
  gender: {
    type: String,
    trim: true,
    required: true
  },
  date_registration: {
    type: Date,
    required: true,
    default: Date.now()
  },
  plan: {
    type: String,
    required: false,
    default: "none"
  },
  status: {
    type: String,
    required: false,
    default: "unverified"
  },
  occupation: {
    type: String,
    required: false
  },
  height: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  nationality: {
    type: String,
    required: false
  },
  marital_status: {
    type: String,
    required: false
  },
  skin_color: {
    type: String,
    required: false
  },
  state_of_origin: {
    type: String,
    required: true
  },
  genotype: {
    type: String,
    required: true
  },
  instagram: {
    type: String,
    required: false
  },
  whatsapp: {
    type: String,
    required: false
  },
  profile_pic: {
    type: String,
    required: false
  },
  profile_public_id: {
    type: String,
    required: false
  },
  plan_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "Plans"
  },
  expiry: {
    type: Date,
    required: true
  },
  resetPasswordToken: {
    type: String,
    required: false,
    select: false
  },
  resetPasswordExpiry: {
    type: Date,
    required: false,
    select: false
  },
  match: [
    {
      matched_to: mongoose.Schema.ObjectId,
      isMyFeature: Boolean,
      date_matched: Date
    }
  ],
  matched_total: {
    type: Number,
    required: false
  }
});

// save middleware
userSchema.pre("save", function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at) this.created_at = currentDate;

  next();
});

// update middleware
userSchema.pre("update", function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at) this.created_at = currentDate;

  next();
});

module.exports = mongoose.model("User", userSchema);

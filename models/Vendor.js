const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const vendorSchema = new Schema({
  customer_name: {
    type: String,
    trim: true,
    required: true
  },
  business_name: {
    type: String,
    trim: true,
    required: true
  },
  acct_name: {
    type: String,
    required: true
  },
  acct_no: {
    type: String,
    trim: true,
    required: true
  },
  bank: {
    type: String,
    trim: true,
    required: true
  },
  status: {
    type: String,
    trim: true,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paid: {
    type: Boolean,
    required: true
  },
  created_at: {
    type: Date,
    required: true,
    default: new Date()
  }
});

// save middleware
vendorSchema.pre("save", function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at) this.created_at = currentDate;

  next();
});

module.exports = mongoose.model("Vendor", vendorSchema);

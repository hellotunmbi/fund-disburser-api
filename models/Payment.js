const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const paymentSchema = new Schema({
  user: {
    type: String,
    trim: true,
    required: true
  },
  balance: {
    type: Number,
    trim: true,
    required: true
  }
});

module.exports = mongoose.model("Payment", paymentSchema);

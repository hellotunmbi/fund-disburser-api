const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');


const featureSchema = new Schema({
	owner_id: {
		type: mongoose.Schema.ObjectId,
		required: true,
		ref: 'User'
	},
	sex: {
		type: String,
		trim: true,
		required: true
	},
	state: {
		type: String,
		trim: true,
		required: true
	},
	city: {
		type: String,
		trim: true,
		required: true
	},
	age_range: {
		type: String,
		required: true
	},
	hangout_location: {
		type: String,
		required: true
	},
	hangout_date_time: {
		type: String,
		required: true
	},
	turn_ons: {
		type: String,
		required: false
	},
	turn_offs: {
		type: String,
		required: false
	},
	other_info: {
		type: String,
		required: false
	},
	status: {
		type: String,
		required: true
	},
	feature_pic: {
		type: String,
		required: false
	},
	feature_public_id: {
		type: String,
		required:false
	},
	plan_name: [{
		type: String,
		required: true
	}],
	matched_count: {
		type: Number,
		default: 0
	},
	connects: [{ connected_by: String, date_connected: String }],
	likes: [{ liked_by: String, date_liked: String }],
	match: [{ matched_to: mongoose.Schema.ObjectId, date_matched: Date }],
	expires_at: Date,
	created_at: Date,
	updated_at: Date
});


featureSchema.pre('save', function (next) {
	// get the current date
	var currentDate = new Date();

	// change the updated_at field to current date
	this.updated_at = currentDate;

	// if created_at doesn't exist, add to that field
	if (!this.created_at)
		this.created_at = currentDate;

	next();
});


// update middleware
featureSchema.pre('update', function (next) {
	// get the current date
	var currentDate = new Date();

	// change the updated_at field to current date
	this.updated_at = currentDate;

	// if created_at doesn't exist, add to that field
	if (!this.created_at)
		this.created_at = currentDate;

	next();
});


featureSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Feature', featureSchema);
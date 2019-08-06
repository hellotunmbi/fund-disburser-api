const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const mongodbErrorHandler = require('mongoose-mongodb-errors');

const plansSchema = new Schema({
	plan_name: {
		type: String,
		required: true
	},
	fee: {
		type: Number,
		required: true
	},
	duration: {
		type: Number,
		required: true
	},
	threshold: {
		type: Number,
		trim: true,
		required: true
	},
	connect_categories: {
		type: [String],
		required: false
	}
});

plansSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Plans', plansSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');


const profileSchema = new Schema({
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
		type: Number,
		trim: true,
		required: true
	},
	email: {
		type: String,
		trim: true,
		lowercase: true,
		required: true,
		unique: true,
		validate: [validator.isEmail, 'Invalid Email Address']
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
	category: {
		type: String,
		required: false,
		default: 'regular'
	},
	status: {
		type: String,
		required: false
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
	profile_image: {
		type: String,
		required: false
	}
});


profileSchema.plugin(passportLocalMongoose);
profileSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Profile', profileSchema);
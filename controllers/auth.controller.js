const  passport = require('passport');
const jwt = require('jsonwebtoken');
// const User = mongoose.model('Users');
const User = require('../models/User');
const Plans = require('../models/Plans');
const sgMail = require('@sendgrid/mail');
const mongoose = require('mongoose');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.validateRegister = (req, res, next) => {
	req.sanitizeBody('first_name');
	req.sanitizeBody('last_name');
	req.sanitizeBody('username');

	req.checkBody('first_name', 'Enter a first name').notEmpty();
	req.checkBody('last_name', 'Enter a last name').notEmpty();
	req.checkBody('phone', 'Phone number is required').notEmpty();
	req.checkBody('email', 'You must enter an email address').notEmpty();
	req.checkBody('gender').notEmpty();
	req.checkBody('username', 'Username field cannot be empty.').notEmpty();
	req.checkBody('password', 'Password cannot be blank').notEmpty();
	req.checkBody('genotype', 'Genotype cannot be blank').notEmpty();

	req.sanitizeBody('email').normalizeEmail({
		remove_dots: false,
		remove_extensions: false,
		gmail_remove_subaddress: false
	});


	const errors = req.validationErrors();
	if (errors) {
		res.json({
			status: 400,
			message: errors.map(error => error.msg) });
		return;
	}
	next(); // there were no errors

};


exports.register = async function (req, res) {
	const { first_name,
		last_name,
		username,
		dob,
		phone,
		email,
		gender,
		date_registration,
		occupation,
		location,
		state_of_origin,
		genotype,
		profile_pic } = req.body;
	const status = 'unverified';
	const matched_total = 0;

	const plan_id = mongoose.Types.ObjectId('5cf816013382cc0e3dea10f2');

	try {
		//Get the plan details from plan_id and append to feature object...
		const nowDate = new Date();
		const foundPlan = await Plans.findById(plan_id);
		const expiry_date = nowDate.setMonth(nowDate.getMonth() + 1); //Expire in 1month time
		const expiry = new Date(expiry_date); // save this to db
		const plan = foundPlan.plan_name;  // save this too to db

		const user = new User({ first_name, last_name, username, dob, phone, email, gender, date_registration, status, occupation, location, state_of_origin, genotype, profile_pic, matched_total, expiry, plan, plan_id });
		const hostURL = 'https://dearmac-api.herokuapp.com/verify/';


		await User.register(user, req.body.password);
		const id = user._id;

		const token = jwt.sign({
			id, first_name, last_name, username, email,  gender, profile_pic, phone
		}, process.env.JWT_SECRET);


		const msg = {
			to: email,
			from: {
				email: 'support@dearmacapp.com',
				name: 'DearMac Support'
			},
			subject: 'Confirm Your Email - DearMac',
			text: 'Welcome to DearMac Platform',
			html: `Dear ${first_name},<br/><br/>
						We have received your request to register on DearMac app.<br/><br/>
						Kindly confirm your email to complete your registration process by clicking the button below:<br/><br/>
						<a href="${hostURL}${id}"><button style="padding: 1rem 2rem; font-size: 1rem; background-color: #fb7400; color: #FFFFFF">Confirm Email</button></a>`
		};
		sgMail.send(msg);

		res.json({
			status: 200,
			data: {
				message: 'Successfully Registered',
				token,
				user
			}
		});
	} catch (err) {
		res.json({
			status: 400,
			data: {
				message: 'Unable to register. Try again',
				error: err
			}
		});
	}
};


exports.login = (req, res, next) => {
	passport.authenticate('local', function (err, user, info) {
		if(err)  { return next(err); }

		const nowDate = new Date();
		const { first_name, last_name, email, username, gender, profile_pic, phone, status, expiry } = user;
		const id = user._id;

		if (!user) {
			res.json({
				status: 404,
				data: {
					message: 'Invalid Login Credentials',
					user,
					err
				}
			});
		} else if(status === 'unverified' ) {
			res.json({
				status: 401,
				data: {
					message: 'Account Not Verified. Check your email for Verification Link',
					user
				}
			});
		} else if (status === 'verified') {
			res.json({
				status: 402,
				data: {
					message: 'You are not subscribed to any plan',
					user
				}
			});
		} else if ((status === 'trial' || status === 'subscribed') && nowDate > expiry) {
			res.json({
				status: 403,
				data: {
					message: 'Sorry, your subscription plan has expired',
					user
				}
			});
		} else if ((status === 'trial' || status === 'subscribed') && nowDate < expiry) {
			const token = jwt.sign({
				id, first_name, last_name, username, email, gender, profile_pic, phone
			}, process.env.JWT_SECRET);
			res.json({
				status: 200,
				data: {
					message: 'Successfully Logged In',
					user,
					token,
					info
				}
			});

		} else {
			res.json({
				status: 400,
				data: {
					message: 'User cannot be authenticated.'
				}
			});
		}


	})(req, res, next);
};



exports.logout = (req, res) => {
	req.logout();
	res.json({ status: 'success', message: 'You have successfully logged out' });
};
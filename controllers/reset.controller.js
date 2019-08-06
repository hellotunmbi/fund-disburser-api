const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const randomstring = require('randomstring');
const moment = require('moment');

// Forgot password
exports.forgotPassword = (req, res) => {
	const email = req.body.email;
	const resetPasswordURL = 'https://dearmac-api.herokuapp.com/reset/';
	const token = randomstring.generate(64);

	const nowDate = Date.now();
	const resetPasswordExpiry = moment(nowDate).add('4', 'hours');


	// Find the user's email, if found, append token and passwordExpiryDate to it
	if(!email) {
		res.json({
			status: 404,
			message: 'Email not set'
		});
	} else {
		User.findOneAndUpdate({ email }, {
			resetPasswordToken: token,
			resetPasswordExpiry
		}, function (err, user) {
			if (!user) {
				res.json({
					status: 404,
					message: 'Email address is invalid.'
				});
			} else {

				const subject = 'Password Reset Instruction';
				const message = `
        Hello ${user.first_name},<br/><br/>
        You are receiving this because you (or someone else) have requested for the
        reset of the password of your account.<br/><br/>

        Please click the following link or paste in your browser to complete the process:<br/><br/>

        <a href="${resetPasswordURL}${token}">${resetPasswordURL}${token}</a><br/><br/>

        If you did not request this, please ignore this email and your password will remain unchanged.<br/>
        Or contact DearMac Admin.<br/><br/>

        Regards,<br/>
        DearMac<br/>
        `;
				sendMail(user.first_name, user.email, subject, message);

				res.json({
					status: 200,
					data: {
						message: 'Password Reset Instruction has been sent to your email.<br/>Kindly check'
					}
				});
			}
		});
	}

};


// Forgot password
exports.resetPassword = (req, res) => {
	const token = req.params.token;

	if(!token) {
		res.send('Invalid URL. Kindly follow exact link from email');
	} else {
		User.findOne({ resetPasswordToken: token, resetPasswordExpiry: { $gt: Date.now() } }, function(err, user) {
			if(!user) {
				res.send('<h3>Invalid URL or token has expired.<br/>Perfom a password reset again from the app.</h3>');
			} else {
				res.render('passwordreset', { token: token });
			}
		});
	}
};



exports.processResetPassword = async (req, res) => {

	const password = req.body.password;
	const retype_password = req.body.retype_password;
	const token = req.body.token;

	if(password != retype_password) {
	  res.send('New Password and Retype Passwords dont match.<br/>Go back and try again');
	} else {
		User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiry: { $gt: Date.now() } }, async function (err, user) {
			if(!user) {
				res.send('<h2>Token expired or Invalid URL.<br/>Go back and try again</h2>');
			} else {
				// await user.setPassword(password);
				// await user.save();
				// res.send('success');
				user.setPassword(password, function (error, newUser) {
					if(error) {
						res.send('<h2>Unable to reset password. Contact Admin</h2>');
					} else {
						user.save();

						// Prepare Reset Confirmation email and send...
						const name = user.first_name;
						const email = user.email;
						const subject = 'Password Reset Confirmation';
						const message = `
            Hello ${name},<br/><br/>

            Your password for DearMac app has been successfully reset.<br/>
            You can now login to the DearMac app with your new password.<br/><br/>

            PS: If you did not authorize this, kindly contact DearMac Admin immediately<br/><br/>

            DearMac<br/>
            `;
						sendMail(name, email, subject, message);

						res.send('<h2>Password Reset Successful. You can login via the app.</h2>');
					}
				});
				// res.send('user found::'+user);
			}
		});
	}

};


const sendMail = (name, email, subject, message) => {
	const msg = {
		to: email,
		from: {
			email: 'support@dearmacapp.com',
			name: 'DearMac Support'
		},
		subject: subject,
		text: 'Welcome to DearMac Platform',
		html: message
	};
	sgMail.send(msg);
};
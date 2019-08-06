const User = require('../models/User');
const Plans = require('../models/Plans');
const Payment = require('../models/Payment');
const moment = require('moment');
const fetch = require('node-fetch');
const sgMail = require('@sendgrid/mail');

const PAYSTACK_API = process.env.PAYSTACK_API;

// Get all plans...
exports.getAllSubscriptions = (req,res) => {

	Plans.find({
		'plan_name': { $ne: 'regal-trial' }
	}).sort({ _id: 'desc' })
		.exec(function(err, plans) {
			if(err) {
				res.json({
					status: 404,
					message: 'Unable to find plan',
					error: err
				});
			} else {
				res.json({
					status: 200,
					data: plans
				});
			}
		});

};



exports.getUserPlansDetails = (req, res) => {
	const user_id = req.params.user_id;

	if (!user_id) { res.json({ status: 400, message: 'User ID Invalid' }); } else {
		User.find({_id: user_id})
			.populate('plan_id')
			.exec(function (err, plans) {
				if (!plans) {
					res.json({
						status: 404,
						message: 'User not found',
						error: err
					});
				} else {
					const { connect_categories, plan_name, duration, description, threshold, _id } = plans[0].plan_id;
					const { expiry, status } = plans[0];
					const userPlan = {
						connect_categories, plan_name, duration, description, threshold, plan_id: _id, expiry, status
					};
					res.json({
						status: 200,
						data: userPlan
					});
				}
			});
	}

};


// Confirm Payment from Paystack Pages and determine what plan to sub user to
exports.paymentConfirmation = async (req, res) => {
	console.log('in paymentConfirmation');
	const ref = req.query.reference;
	const planName = req.params.planname;

	// if ref and planName are not set, return error
	if(!ref) {
		res.json({
			status: 400,
			message: 'Invalid Reference Number'
		});
	} else if (!planName) {
		res.json({
			status: 400,
			message: 'Plan Cannot Be Found.'
		});
	}

	const url = PAYSTACK_API + '/transaction/verify/' + ref;
	const subscriptionURL = PAYSTACK_API + '/subscription';

	const planToSubscribe = {
		'regular': 'PLN_on8thar1rezrjcd',
		'pre-elite': 'PLN_qgwkglfxp0ae0zx',
		'elite': 'PLN_40zo96575qqyunf',
		'regal': 'PLN_jon0nz7mchyy5be',
		'dm-premium': 'PLN_u1lfq7atxwtnl18',
	};

	const planSubscribed = {
		'regular': 'Regular',
		'pre-elite': 'Pre-Elite',
		'elite': 'Elite',
		'regal': 'Regal',
		'dm-premium': 'Premium',
	};

	console.log('ref: ', ref);
	console.log('planName: ', planName);

	try {
		// Verify transaction using ref query
		const options = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.BEARER_AUTH}`
			}
		};
		const transactionCallbackRaw = await fetch(url, options);
		const transactionCallback = await transactionCallbackRaw.json();

		if (transactionCallback.status === true) {
			const {
				customer: { first_name,
					last_name,
					email,
					customer_code,
					phone },
				reference,
				amount,
				paid_at,
				ip_address,
				plan_object: { name },
				plan,
				authorization
			} = transactionCallback.data;

			// first_name, last_name, reference, amount, paid_at, ip_address, email, customer_code, plan_name, plan_id
			const subscriptionDetails = {
				first_name,
				last_name,
				email,
				customer_code,
				phone,
				reference,
				amount,
				paid_at,
				ip_address,
				plan_name: name,
				plan_id: plan,
				authorization
			};
			subscriptionDetails.domain = 'test';
			subscriptionDetails.created_at = new Date();

			// Set deduction start date to next 1 month...
			const nowDate = new Date();
			const nextOneMonth = nowDate.setMonth(nowDate.getMonth() + 1);
			const nextOneMonthDateValue = new Date(nextOneMonth);
			const nextOneMonthDate = moment(nextOneMonth).format('MMMM Do YYYY, h:mm:ss a');

			// Save to Payments collection...
			const newPayment = new Payment(subscriptionDetails);
			await newPayment.save();
			console.log('SAVED TO PAYMENT');


			// Subscribe user to their appropriate plan on paystack...
			const subscribeBody = {
				customer: email,
				plan: planToSubscribe[planName],
				start_date: nextOneMonthDateValue
			};

			const options = {
				method: 'post',
				body: JSON.stringify(subscribeBody),
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.BEARER_AUTH}` },
			};
			const subscribeUserToPlanRaw = await fetch(subscriptionURL, options);
			const subscribeUserToPlan = await subscribeUserToPlanRaw.json();

			if(subscribeUserToPlan) {
				console.log('SUBSCRIBED TO PLAN');
			}

			// If successful, update customer details, subscribe them to a plan and save to db
			if(subscribeUserToPlan.status === true) {
				console.log('in sub user to plan');
				const updatedUserDetails = await User.findOneAndUpdate({ email }, { $set: { status: 'trial', expiry: nextOneMonthDateValue } });
				console.log('UPDATED USER DETAILS');

				// If it successfully updated user records...
				if(updatedUserDetails) {
					// Send personalized email
					const subject = 'You have been subscribed to DearMac';
					const message = `
					Howdy ${first_name}!<br/><br/>
					You have been successfully subscribed to ${planSubscribed[planName]} plan on DearMac<br/><br/>
					Enjoy the full benefit of connection with DearMac.<br/><br/>
					Your next billing date is: ${nextOneMonthDate}<br/><br/>
					Regards<br/>
				`;
					const msg = {
						to: email,
						from: {
							email: 'support@dearmacapp.com',
							name: 'DearMac'
						},
						subject: subject,
						text: subject,
						html: message
					};
					sgMail.send(msg);
				}

				res.render('subscriptionconfirmation');
			} else {
				res.json({
					status: 400,
					message: 'Unable to subscribe user to plan',
					errorMessage: subscribeUserToPlan
				});
			}



			// res.json({
			// 	status: 200,
			// 	message: 'Subscribed to plan',
			// 	subscribed: subscribeUserToPlan
			// });
		}

	}	catch(err) {
		res.json({ status: 404, message: 'Unable to subscribe you to a plan' });
	}

};



// exports.subscriptionConfirmation = (req, res) => {

// 	const axiosInstance = axios.create({
// 		baseURL: PAYSTACK_SUBSCRIPTION_URL,
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Authorization': 'Bearer sk_test_24b0752d944c3df08cc126e630e18ad830f8aa6c'
// 		}
// 	});

// 	fetch('https://httpbin.org/post', {
// 		method: 'post',
// 		body: JSON.stringify(body),
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Authorization': 'Bearer sk_test_24b0752d944c3df08cc126e630e18ad830f8aa6c'
// 		 },
// 	})
// 		.then(res => res.json())
// 		.then(json => console.log(json));

// 	axiosInstance.post(		{
// 			customer: customeremail,
// 			plan: planID
// 		})

// };

// unites
// skoolmed
// unaf
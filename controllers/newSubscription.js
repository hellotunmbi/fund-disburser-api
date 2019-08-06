
// Confirm Payment from Paystack Pages and determine what plan to sub user to
exports.paymentConfirmation = async (req, res) => {
	console.log('in paymentConfirmation');
	const ref = req.query.reference;
	const planName = req.params.planname;

	const url = PAYSTACK_URL + '/transaction/verify/' + ref;
	const subscriptionURL = PAYSTACK_URL + '/subscription';

	const planToSubscribe = {
		'regulartrial': 'PLN_sink0jbf4nkt93d',
		'preelitetrial': 'PLN_kpix6ibjcya2qva',
		'elitetrial': 'PLN_nsteed5740qy4be',
		'regaltrial': 'PLN_onf5lze29ylql6j',
		'premiumtrial': 'PLN_9g5h22rl10pmpbs',
	};

	const planSubscribed = {
		'regulartrial': 'Regular',
		'preelitetrial': 'Pre-Elite',
		'elitetrial': 'Elite',
		'regaltrial': 'Regal',
		'premiumtrial': 'Premium',
	};

	console.log('ref: ', ref);
	console.log('planName: ', planName);

	if(!ref && !planName) {
		res.json({
			status: 404,
			message: 'Invalid Reference Number'
		});
	}


	try {
		// Verify transaction using ref query
		const headers = {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer sk_test_24b0752d944c3df08cc126e630e18ad830f8aa6c'
		};
		const transactionCallbackRaw = await fetch(url, headers);
		const transactionCallback = transactionCallbackRaw.json();

		if (transactionCallback.status == true) {
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
			const nextOneMonthDate = moment(nextOneMonth).format('MMMM Do YYYY, h:mm:ss a');

			const subscribeBody = {
				customer: email,
				plan: planToSubscribe[planName],
				start_date: nextOneMonth
			};

			// Save to Payments collection...
			const newPayment = new Payment(subscriptionDetails);
			await newPayment.save();

			console.log('SAVED TO PAYMENT');

			// Subscribe user to their appropriate plan on paystack...
			const options = {
				method: 'post',
				body: JSON.stringify(subscribeBody),
				headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk_test_24b0752d944c3df08cc126e630e18ad830f8aa6c' },
			};
			const subscribeUserToPlanRaw = await fetch(subscriptionURL, options);
			// const subscribeUserToPlan = subscribeUserToPlanRaw.json();

			console.log('SUBSCRIBED TO PLAN');

			// If successful, update customer details, subscribe them to a plan and save to db
			const updatedUserDetails = User.findOneAndUpdate({ email }, { status: 'trial', expiry: nextOneMonthDate });

			console.log('UPDATED USER DETAILS');

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

			// Show confirmation page...
			res.render('subscriptionconfirmation');


		} else {
			res.json({
				status: 400,
				message: 'Plan subscription failed. Try again'
			});
		}
	}	catch(err) {
		res.json({ status: 404, message: 'Unable to subscribe you to a plan' });
	}

};
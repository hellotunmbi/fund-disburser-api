const User = require('../models/User');
const Feature = require('../models/Feature');

exports.getSingleUser = (req, res) => {
	const id = req.params.id;

	if(!id) { res.json({ status: 400, message: 'User ID Invalid' }); } else {
		User.findById(id, function(err, user) {
			if(err) {
				res.json({
					status: 404,
					message: 'User not found'
				});
			} else {
				res.json({
					status: 200,
					data: user
				});
			}
		});
	}

};


// UPDATE SINGLE USER
exports.updateSingleUser = (req, res) => {
	const id = req.params.id;

	if (!id) { res.json({ status: 400, message: 'User ID Invalid' }); } else {
		User.findByIdAndUpdate(id, { $set: req.body }, function (err, user) {
			if (err) {
				res.json({
					'status': 404,
					'message': 'User not found'
				});
			} else {
				res.json({
					'status': 200,
					'data': {
						'user': user,
						'message': 'Your profile has been successfully updated'
					}
				});
			}
		});
	}
};

// GET USER LOCATION...
exports.getUserLocation = (req, res) => {
	const id = req.params.id;

	if (!id) {
		res.json({ status: 400, message: 'User ID Invalid' });
	} else {
		User.findById(id, function(err, user) {
			if (err) {
				res.json({
					status: 404,
					message: 'User location could not be found'
				});
			} else {
				res.json({
					status: 200,
					location: user.location
				});
			}
		});
	}
};



// GET USER MATCHES...
exports.getUserMatches = (req, res) => {
	const id = req.params.id;

	if (!id) {
		res.json({ status: 400, message: 'User ID Invalid' });
	} else {
		User.findById(id, function(err, user) {
			if (err) {
				res.json({
					status: 404,
					message: 'User location could not be found'
				});
			} else {
				res.json({
					status: 200,
					location: user.location
				});
			}
		});
	}
};


// GET FEATURES BY A USER
exports.getFeaturesByUser = (req, res) => {
	const user_id = req.params.user_id;
	const nowDate = new Date();
	if (!user_id) {
		res.json({ status: 400, message: 'User ID Invalid' });
	} else {
		Feature.find({ owner_id: user_id, expires_at: { $gt: nowDate } }, null, { sort: { created_at: -1 }}, function(err, features) {
			if (err) {
				res.json({
					status: 404,
					data: {
						message: 'No feature found: '+err
					}
				});
			} else {
				res.json({ status: 200, features: features, user_id });
			}
		});
	}
};


// Set Profile Pic
exports.setProfilePic = (req, res) => {
	console.log(req.file);

	res.json({
		image_url: req.file.url,
		public_id: req.file.public_id
	});
};
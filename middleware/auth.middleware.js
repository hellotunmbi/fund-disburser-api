const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
	const token = req.headers['x-access-token'];
	if (!token)
		return res.json({ 'status': 403, 'message': 'No token provided.' });

	jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
		if (err)
			return res.json({ 'status': 500, 'message': 'Failed to authenticate token.', err });
		// if everything good, save to request for use in other routes
		req.userId = decoded.id;
		next();
	});

};
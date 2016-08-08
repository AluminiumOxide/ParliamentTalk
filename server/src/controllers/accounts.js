var mongoose = require('mongoose');
var when = require('when');
var User = mongoose.model('User');

/**
 * @class
 * A controller to manage accounts
 */
var Account = module.exports = {};

/**
 * Signs up a new user
 * @param {http.request} req - The request object, with json body: { 
				name: string, 
				email: string, 
				password: string }
 * @param {http.response} res - The response object:
				<li> 400 if invalid data, with json body: {error: string, field: string} </li>
				<li> 201 on success, with json body: {} </li>
 */
Account.signUp = function(req, res) {
	var account = new User();

	// check and set the name
	return when(account.setName(req.body.name))
		.then(success => {
			if(!success) {
				return res.status(400).json({
					error: 'Invalid user name', 
					field: 'name'
				});
			}

			// check and set the email
			return when(account.setEmail(req.body.email))
				.then(success => {
					if(!success) {
						return res.status(400).json({
							error: 'Invalid email', 
							field: 'email'
						});
					}

					// check and set the password
					return when(account.setPassword(req.body.password))
						.then(success => {
							if(!success) {
								return res.status(400).json({
									error: 'Invalid password', 
									field: 'password'
								});
							}

							// save the new user
							return when(account.save())
								.then(() => {
									return res.status(201).json({});
								});
						});
				});
		});
};

/**
 * Signs a user in
 * @param {http.request} req - The request object
 * @param {http.response} res - The response object
 */
Account.signIn = function(req, res) {
	res.status(201).json({status: 'success'});
};

/**
 * Signs a user out
 * @param {http.request} req - The request object
 * @param {http.response} res - The response object
 */
Account.signOut = function(req, res) {
	res.status(201).json({status: 'success'});
};


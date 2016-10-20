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
 * @param {http.request} req - The request object, with json body: {
				name: string,
				password: name }
 * @param {http.response} res - The response object
				<li> 400 if invalid credentials, with json body: {error: string} </li>
				<li> 201 on success, with json body: {token: string} </li>
 */
Account.signIn = function(req, res) {
	//return when(User.findOne({name:req.body.name}))
	return when(User.findOne({name:req.body.name}).exec())
		.then(user => {
			if(!user) {
				return res.status(400).json({
					error: 'Invalid user name or password'
				});
			}
			if(user.matchPassword(req.body.password)) {
				return when(user.generateLogin())
					.then(token => {
						return res.status(201).json({
							token: token
						});
					});
			} else {
				return res.status(400).json({
					error: 'Invalid user name or password'
				});
			}
		});
};

/**
 * Signs a user out
 * @param {http.request} req - The request object, with x-access-token headers set
 * @param {http.response} res - The response object:
				<li> 400 if invalid token, with json body: {error: string} </li>
				<li> 201 on success, with json body: {} </li>
 */
Account.signOut = function(req, res) {
	if(req.headers['x-access-token']) {
		return when(User.verifyLogin(req.headers['x-access-token']))
				.then(user => {
					if(!user) {
						return res.status(400).json({error: 'invalid token'});
					}
					user.login = {};
					return when(user.save())
						.then(() => {
							return res.status(201).json({});
						})
						.otherwise(err => {
							return res.status(400).json({error: 'invalid token'});
						});
				})
				.otherwise(err => {
					return res.status(400).json({error: 'invalid token'});
				});
	} else {
		return res.status(400).json({error: 'invalid token'});
	}					
};


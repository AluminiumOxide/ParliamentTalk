'use strict';

var mongoose = require('mongoose');
var when = require('when');
var User = mongoose.model('User');
var emailer = require('../lib/emailer');
var emailerInst = emailer.getInstance();

/**
 * View user data
 * @param {http.request} req - The request object, with x-access-token headers set
 * @param {http.response} res - The response object:
 *                              <li> 400 if invalid token, with json body: {error: string} </li>
 *                              <li> 201 on success, with json body: { _id: string, name: string, email: string } </li>
 */
exports.viewAccount = function(req, res, next) {
	var args = (req && req.params && req.swagger.params) ? req.swagger.params : "";
	return when(verifyLogin(req))
		.then(user => {
			delete user['password'];
			res.statusCode = 200;
			res.end(JSON.stringify(user));
			return next();
		})
		.otherwise(err => {
			res.statusCode = 400;
			res.end(JSON.stringify({}));
			return next();
		});
}

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
exports.createAccount = function(req, res, next) {

	var account = new User();
	
	// check and set the name
	return when(account.setName(req.body.name))
		.then(success => {
			if(!success) {
				res.statusCode = 400;
				res.end(JSON.stringify({
					error: 'Invalid user name',
					field: 'name'
				}));
				return next();
			}

			// check and set the email
			return when(account.setEmail(req.body.email))
				.then(success => {
					if(!success) {
						res.statusCode = 400;
						res.end(JSON.stringify({
							error: 'Invalid email',
							field: 'email'
						}));
						return next();
					}

					// check and set the password
					return when(account.setPassword(req.body.password))
						.then(success => {
							if(!success) {
								res.statusCode = 400;
								res.end(JSON.stringify({
									error: 'Invalid password',
									field: 'password'
								}));
								return next();
							}

							// check and set language preference
							return when(account.setLanguage(req.body.language))
								.then(success => {
									if(!success) {
										res.statusCode = 400;
										res.end(JSON.stringfy({
											error: 'Unsupported language',
											field: 'lang'
										}));
										return next();
									}
		
									// save the new user
									return when(account.save())
										.then(() => {
											res.statusCode = 201;
											res.end();
											return next();
										}).otherwise(err => {
											res.statusCode = 500;
											res.end();
											return next();
										});
								}).otherwise(err => {
									res.statusCode = 500;
									res.end();
									return next();
								});
						}).otherwise(err => {
							res.statusCode = 500;
							res.end();
							return next();
						});
				}).otherwise(err => {
					res.statusCode = 500;
					res.end();
					return next();
				});
		}).otherwise(err => {
			res.statusCode = 500;
			res.end();
			return next();
		});
}

/**
 * Update user data
 * @param {http.request} req - The request object, with x-access-token headers set
 * @param {http.response} res - The response object:
 *                              <li> 400 if invalid token, with json body: {error: string} </li>
 *                              <li> 201 on success, with json body: { _id: string, name: string, email: string } </li>
 */
exports.updateAccount = function(req, res, next) {
	return when(verifyLogin(req))
		.then(user => {

			// Figure out what changes the user wants us to make
			var todo = [];
			if(!!req.body.name && req.body.name !== user.name) {
				todo.push(new Promise((resolve,reject) => {
					resolve(user.setName(req.body.name)); 
				}));
			}
			if(!!req.body.email && req.body.email !== user.email) {
				todo.push(new Promise((resolve,reject) => { 
					resolve(user.setEmail(req.body.email)); 
				}));
			}
			if(!!req.body.password) {
				todo.push(new Promise((resolve,reject) => {
					resolve(user.setPassword(req.body.password)); 
				}));
			}
			if(!!req.body.lang && req.body.lang !== user.lang) {
				todo.push(new Promise((resolve,reject) => {
					resolve(user.setLanguage(req.body.language));
				}));
			}

			// Return 200 if there's nothing to update
			if(todo.length === 0) {
				res.statusCode = 200;
				res.end();
				return next();
			};

			// Make the changes
			return when.all(todo)
				.then(success => {
					if(success.every(function(e,i,a){return e})) {
						return when(user.save())
							.then(() => {
								res.statusCode = 200;
								res.end();
								return next();
							}).otherwise(err => {
								res.statusCode = 500;
								res.end();
								return next();
							});
					} else {
						res.statusCode = 500;
						res.end();
						return next();
					}
				})
				.otherwise(err => {
					res.statusCode = 500;
					res.end();
					return next();
				});
		})
		.otherwise(err => {
			res.statusCode = 400;
			res.end(JSON.stringify({}));
			return next();
		});
}

/**
 * Sets account to deleted
 * @param {http.request} req - The request object, with x-access-token headers set
 * @param {http.response} res - The response object:
 *                              <li> 400 if invalid token, with json body: {error: string} </li>
 *                              <li> 200 on success, with json body: { _id: string, name: string, email: string } </li>
 */ 
exports.deleteAccount = function(req, res, next) {

	// check the user's login
	return when(verifyLogin(req))
		.then(user => {
			
			// set the user to deleted
			if(user.setDeleted()) {

				// save the user
				return when(user.save())
					.then(() => {
						res.statusCode = 200;
						res.end();
						return next();
					})
					.otherwise(err => {
						res.statusCode = 500;
						res.end(JSON.stringify({}));
						return next();
					});
			} else {
				res.statusCode = 400;
				res.end(JSON.stringify({}));
				return next();
			}
		})
		.otherwise(err => {
			res.statusCode = 400;
			res.end(JSON.stringify({}));
			return next();
		});
}

/**
 * Checks a potential user name
 * @param {http.request} req - The request object
 * @param {http.response} res - The response object:
 * 								<li>200 with boolean body</li>
 */
exports.checkName = function(req,res,next) {
	return when(User.checkName((req && req.body) ? JSON.parse(req.body) : ""))
		.then(result => {
			res.statusCode = 200;
			res.end(result.toString());
			return next();
		});
};

/**
 * Checks a potential email
 * @param {http.request} req - The request object
 * @param {http.response} res - The response object:
 * 								<li>200 with boolean body</li>
 */
exports.checkEmail = function(req,res,next) {
	return when(User.checkEmail((req && req.body) ? JSON.parse(req.body) : ""))
		.then(result => {
			res.statusCode = 200;
			res.end(result.toString());
			return next();
		});
};

/**
 * Checks a potential password
 * @param {http.request} req - The request object
 * @param {http.response} res - The response object:
 * 								<li>200 with boolean body</li>
 */
exports.checkPassword = function(req,res,next) {
	return when(User.checkPassword((req && req.body) ? JSON.parse(req.body) : ""))
		.then(result => {
			res.statusCode = 200;
			res.end(result.toString());
			return next();
		});
};

/**
 * Checks a potential preferred language
 * @param {http.request} req - The request object
 * @param {http.response} res - The response object:
 * 								<li>200 with boolean body</li>
 */
exports.checkLanguage = function(req,res,next) {
	return when(User.checkLanguage((req && req.body) ? JSON.parse(req.body): ""))
		.then(result => {
			res.statusCode = 200;
			res.end(result.toString());
			return next();
		});
};

/**
 * Verifies an email address
 * @param {http.request} req - The request object
 * @param {http.response} res - The response object:
 * 								<li>200 with boolean body</li>
 */
exports.verifyEmail = function(req, res, next) {
	if(!!req.body.email || !!req.body.verificationCode) {
		if(!!req.body.email && !!req.body.verificationCode) {
			return when(User.verifyEmailVerification(req.body.email,req.body.verificationCode))
				.then(generated => {
					if(generated) {
						res.statusCode = 200;
						res.end(JSON.stringify(true));
						return next();
					} else {
						res.statusCode = 200;
						res.end(JSON.stringify(false));
						return next();
					}
				}).otherwise(err => {
					res.statusCode = 500;
					res.end(JSON.stringify(false));
					return next();
				});
		} else {
			res.statusCode = 200;
			res.end(JSON.stringify(false));
			return next();
		}
	} else {	
		return when(verifyLogin(req))
			.then(user => {
				return when(user.generateEmailVerification())
					.then(generated => {
						if(generated) {
							return when(emailerInst.sendEmail('emailVerify',user._id))
								.then(() => {
									res.statusCode = 200;
									res.end(JSON.stringify(true));
									return next();
								}).otherwise(err => {
									res.statusCode = 500;
									res.end(JSON.stringify(false));
									return next();
								});
						} else {
							res.statusCode = 200;
							res.end(JSON.stringify(false));
							return next();
						}
					}).otherwise(err => {
						res.statusCode = 500;
						res.end(JSON.stringify(false));
						return next();
					});
			})
			.otherwise(err => {
				res.statusCode = 400;
				res.end(JSON.stringify(false));
				return next();
			});
	}
}

/**
 * Recover Deleted Account
 * 
 */
exports.recoverDeleted = function(req, res, next) {
	if(!!req.body.email && !!req.body.code && !!req.body.password) {
		return when(User.verifyAccountRecovery(req.body.email,req.body.code,req.body.password))
			.then(verified => {
				if(verified) {
					res.statusCode = 200;
					res.end(JSON.stringify(true));
					return next();
				} else {
					res.statusCode = 200;
					res.end(JSON.stringify(false));
					return next();
				}
			}).otherwise(err => {
				res.statusCode = 500;
				res.end(JSON.stringify(false));
				return next();
			});	
	} else {
		if(!!req.body.email && !!!req.body.code && !!!req.body.password) {
			return when(User.generateAccountRecovery(req.body.email))
				.then(generated => {
					if(generated) {
						return when(emailerInst.sendEmail('accountRecovery',generated._id))
							.then(() => {
								res.statusCode = 200;
								res.end(JSON.stringify(true));
								return next();
							}).otherwise(err => {
								res.statusCode = 500;
								res.end(JSON.stringify(false));
								return next();
							});
					} else {
						res.statusCode = 200;
						res.end(JSON.stringify(false));
						return next();
					}
				}).otherwise(err => {
					res.statusCode = 500;
					res.end(JSON.stringify(false));
					return next();
				});
			} else {
				res.statusCode = 200;
				res.end(JSON.stringify(false));
				return next();
			}
		}
}

/**
 * Recover lost user name 
	*/
exports.recoverUsername = function(req, res, next) {
	if(!!req.body.email) {
		return when(User.findOne({email:req.body.email}).exec())
			.then(user => {
				if(!!user) {
					return when(emailerInst.sendEmail('nameRecovery',user._id))
						.then(() => {
							res.statusCode = 200;
							res.end(JSON.stringify(true));
							return next();
						}).otherwise(err => {
							res.statusCode = 500;
							res.end(JSON.stringify(false));
							return next();
						});
				} else {
					res.statusCode = 200;
					res.end(JSON.stringify(false));
					return next();
				}
			}).otherwise(err => {
				res.statusCode = 500;
				res.end(JSON.stringify(false));
				return next();
			});
	} else {
		res.statusCode = 200;
		res.end(JSON.stringify(false));
		return next();
	}
}

/**
 * Recover Account Password
 * 
 */
exports.recoverPassword = function(req, res, next) {
	if(!!req.body.email && !!req.body.code && !!req.body.password) {
		return when(User.verifyPasswordRecovery(req.body.email,req.body.code,req.body.password))
			.then(verified => {
				if(verified) {
					res.statusCode = 200;
					res.end(JSON.stringify(true));
					return next();
				} else {
					res.statusCode = 200;
					res.end(JSON.stringify(false));
					return next();
				}
			}).otherwise(err => {
				res.statusCode = 500;
				res.end(JSON.stringify(false));
				return next();
			});	
	} else {
		if(!!req.body.email && !!!req.body.code && !!!req.body.password) {
			return when(User.generatePasswordRecovery(req.body.email))
				.then(generated => {
					if(generated) {
						return when(emailerInst.sendEmail('passwordRecovery',generated._id))
							.then(() => {
								res.statusCode = 200;
								res.end(JSON.stringify(true));
								return next();
							}).otherwise(err => {
								res.statusCode = 500;
								res.end(JSON.stringify(false));
								return next();
							});
					} else {
						res.statusCode = 200;
						res.end(JSON.stringify(false));
						return next();
					}
				}).otherwise(err => {
					res.statusCode = 500;
					res.end(JSON.stringify(false));
					return next();
				});
			} else {
				res.statusCode = 200;
				res.end(JSON.stringify(false));
				return next();
			}
		}
}

/**
 * Verify login
 * Helper function to check the user's request header is OK
 * @param  {http.request} req - The request object
 * @return {promise} - Either a rejected promise, if login info is invalid, or promised user
 */
var verifyLogin = function(req) {
        if(req.headers && 'x-access-token' in req.headers) {
                return when(User.verifyLogin(req.headers['x-access-token']))
                                .then(user => {
                                        if(!user) {
                                                return when.reject();
                                        }
                                        return when.resolve(user);
                                })
                                .otherwise(err => {
                                        return when.reject();
                                });
        } else {
                return when.reject();
        }

};

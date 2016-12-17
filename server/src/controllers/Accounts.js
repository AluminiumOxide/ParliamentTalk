'use strict';

var mongoose = require('mongoose');
var when = require('when');
var User = mongoose.model('User');

//exports.deleteAccount = function(req, res, next) {
//  /**
//   * parameters expected in the args:
//  * xAuth (String)
//  **/
//	var args = (req && req.params && req.swagger.params) ? req.swagger.params : "";
//    var examples = {};
//  examples['application/json'] = { };
//  if(Object.keys(examples).length > 0) {
//    res.setHeader('Content-Type', 'application/json');
//    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
//  }
//  else {
//    res.end();
//  }
//  
//}

//exports.recoverAccount = function(req, res, next) {
//  /**
//   * parameters expected in the args:
//  * email (Email)
//  **/
//	var args = (req && req.params && req.swagger.params) ? req.swagger.params : "";
//    var examples = {};
//  examples['application/json'] = { };
//  if(Object.keys(examples).length > 0) {
//    res.setHeader('Content-Type', 'application/json');
//    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
//  }
//  else {
//    res.end();
//  }
//  
//}



//exports.verifyAccount = function(req, res, next) {
//  /**
//   * parameters expected in the args:
//  * xAuth (String)
//  * verificationCode (VerificationCode)
//  **/
//	var args = (req && req.params && req.swagger.params) ? req.swagger.params : "";
//    var examples = {};
//  examples['application/json'] = { };
//  if(Object.keys(examples).length > 0) {
//    res.setHeader('Content-Type', 'application/json');
//    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
//  }
//  else {
//    res.end();
//  }
//  
//}

//exports.verifyEmail = function(req, res, next) {
//  /**
//   * parameters expected in the args:
//  * email (Email)
//  **/
//	var args = (req && req.params && req.swagger.params) ? req.swagger.params : "";
//    var examples = {};
//  examples['application/json'] = { };
//  if(Object.keys(examples).length > 0) {
//    res.setHeader('Content-Type', 'application/json');
//    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
//  }
//  else {
//    res.end();
//  }
//  
//}

//exports.verifyName = function(req, res, next) {
//  /**
//   * parameters expected in the args:
//  * name (Username)
//  **/
//	var args = (req && req.params && req.swagger.params) ? req.swagger.params : "";
//    var examples = {};
//  examples['application/json'] = { };
//  if(Object.keys(examples).length > 0) {
//    res.setHeader('Content-Type', 'application/json');
//    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
//  }
//  else {
//    res.end();
//  }
//  
//}

//exports.verifyPassword = function(req, res, next) {
//  /**
//   * parameters expected in the args:
//  * name (Password)
//  **/
//	var args = (req && req.params && req.swagger.params) ? req.swagger.params : "";
//    var examples = {};
//  examples['application/json'] = { };
//  if(Object.keys(examples).length > 0) {
//    res.setHeader('Content-Type', 'application/json');
//    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
//  }
//  else {
//    res.end();
//  }
//  
//}

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
 * Update user data
 * @param {http.request} req - The request object, with x-access-token headers set
 * @param {http.response} res - The response object:
 *                              <li> 400 if invalid token, with json body: {error: string} </li>
 *                              <li> 201 on success, with json body: { _id: string, name: string, email: string } </li>
 */
exports.updateAccount = function(req, res, next) {
	var args = (req && req.params && req.swagger.params) ? req.swagger.params : "";
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

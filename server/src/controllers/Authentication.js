'use strict';

var mongoose = require('mongoose');
var when = require('when');
var User = mongoose.model('User');

/**
 * Signs a user in
 * @param {http.request} req - The request object, with json body: {
                                name: string,
                                password: name }
 * @param {http.response} res - The response object
                                <li> 400 if invalid credentials, with json body: {error: string} </li>
                                <li> 201 on success, with json body: {token: string} </li>
 */
exports.signIn = function(req, res, next) {
	var args = (req && req.swagger && req.swagger.params) ? req.swagger.params : "";
        return when(User.findOne({name:req.body.name}).exec())
                .then(user => {
                        if(!user) {
                                res.statusCode = 400;
				res.end(JSON.stringify({
                                        error: 'Invalid user name or password'
                                }));
				return next();
                        }
                        if(user.matchPassword(req.body.password)) {
                                return when(user.generateLogin())
                                        .then(token => {
                                                res.statusCode = 200;
						res.end(JSON.stringify({
                                                        token: token
                                                }));
						return next();
                                        });
                        } else {
                                res.statusCode = 400;
				res.end(JSON.stringify({
                                        error: 'Invalid user name or password'
                                }));
				return next();
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
exports.signOut = function(req, res, next) {
	var args = (req && req.swagger && req.swagger.params) ? req.swagger.params : "";
        return when(verifyLogin(req))
                .then(user => {
                        user.login = {};
                        return when(user.save())
                                .then(() => {
                                        res.statusCode = 200;
					res.end();
					return next();
                                })
                                .otherwise(err => {
                                        res.statusCode = 400;
					res.end(JSON.stringify({error: 'invalid token'}));
					return next();
                                });
                })
                .otherwise(err => {
                	res.statusCode = 400;
			res.end(JSON.stringify({error: 'invalid token'}));
			return next();
                });
};

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
exports.signUp = function(req, res, next) {

	var args = (req && req.swagger && req.swagger.params) ? req.swagger.params : "";
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
}

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


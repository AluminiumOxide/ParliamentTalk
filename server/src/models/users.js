var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var when = require('when');
var bcrypt = require('bcrypt');
var moment = require('moment');

/**
 * @class
 * A model to represent user accounts
 */
var User = new mongoose.Schema({

	/** 
	 * The user name
	 * @var {string} User.name
	 */
	name: String,

	/** 
	 * The user's email
	 * @type string 
	 * @memberOf User
	 */
	email: String,

	/** 
	 * The user's password: {salt: string, encrypted: string}
	 * @type object
	 * @memberOf User
	 */
	password: {
		salt: String,
		encrypted: String
	},

	/** 
	 * When the user was created
	 * @type date 
	 * @memberOf User
	 */
	created: Date,

	/**
	 * When the user was updated
	 * @type date
	 * @memberOf User
	 */
	updated: Date,

	/**
	 * Whether or not the user has deleted thier account
	 * @type boolean
	 * @memberOf User
	 */
	deleted: {
		type: Boolean,
		default: false
	},

	/**
	 * The recovery object: {field: string, code: string}
	 * @type object
	 * @memberOf User
	 */
	recovery: {
		field: {
			type: String,
		//	enum: ['deleted','name','password'],
			default: ''
		},
		code: {
			type: String,
			default: ''
		}
	},		

	/** 
	 * The user's verification info: {email: boolean, code: string}
	 * @type object
	 * @memberOf User
	 */
	verified: {
		email: { 
			type: Boolean,
			default: false
		}, 
		code: String
	},

	/**
	 * The user's login info: {code: string, timestamp: date}
	 * @type object
	 * @memberOf User
	 */
	login: {
		code: String,
		timestamp: Date
	}

});

/**
 * Updates timestamps before saving
 * @function preSave
 * @memberof User#
 * @name preSave
 * @param {callback} next - the next action
 */
User.pre('save', function(next) {

	// update the updated timestamp
	var now = new Date();
	this.updated = now;

	// update the created timestamp, if necessary
	if(!this.created) {
		this.created = now;
	}

	// hop to the next option
	next();
});

/**
 * Sets the user name
 * @function setName
 * @memberof User#
 * @name setName
 * @param {string} name - The new user name
 * @returns {boolean} Whether or not the name was set
 */
User.methods.setName = function(name) {
	return when(User.checkName(name))
		.then(valid => {
			if(valid) {
				this.name = name;
				return true;
			} else {
				return false;
			}
		});
};

/**
 * Checks the user name
 * @function checkName
 * @memberof User#
 * @name checkName
 * @param {string} name - The new user name
 * @returns {boolean} Whether or not the name is valid
 */
User.statics.checkName = function(name) {
	// contains only letters and numbers
	var regex = /^[a-z0-9]+$/i;
	if(!!name && name.length > 4 && name.length < 26 && regex.test(name)) {
		return when(User.count({'name':name}))
			.then(count => {
				if(count === 0) {
					return true;
				} else {
					return false;
				}
			});
	} else {
		return false;
	}
};

/**
 * Sets the user's email
 * @function setEmail
 * @memberof User#
 * @name setEmail
 * @param {string} email - The new email
 * @returns {boolean} Whether the email was set
 */
User.methods.setEmail = function(email) {
	return when(User.checkEmail(email))
		.then(valid => {
			if(valid) {
				return when(this.resetEmailVerification())
					.then(() => {
						this.email = email;
						return true;
					});
			} else {
				return false;
			}
		});
};

/**
 * Checks that the new user's email is valid
 * @function checkEmail
 * @memberof User#
 * @name checkEmail
 * @param {string} email - The new email
 * @returns {boolean} Whether or not the email is unique
 */
User.statics.checkEmail = function(email) {
	// fits the <blah>@<blah>.<blah> pattern
	var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	if(!!email && regex.test(email)) {
		return User.count({'email':email})
			.then(count => {
				if(count === 0) {
					return true;
				} else {
					return false;
				}
			});
	} else {
		return false;
	}
};

/** 
 * Encrypts and sets the user's password.
 * @function setPassword
 * @memberof User#
 * @name setPassword
 * @param {string} password - The new password
 * @returns {boolean} Whether the password was set
 */
User.methods.setPassword = function(password) {
	if(User.checkPassword(password)) {
		this.password = {};
		this.password.salt = bcrypt.genSaltSync(10);
		this.password.encrypted = bcrypt.hashSync(password, this.password.salt);
		return true;
	}
	return false;
};

/**
 * Checks that the new password is valid
 * @function checkPassword
 * @memberof User#
 * @name checkPassword
 * @param {string} password - The new password
 * @returns {boolean} Whether or not the password is valid
 */
User.statics.checkPassword = function(password) {
	// has at least: 1 lower case, 1 uppper case, 1 digit, 1 symbol
	var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-+_!@#$%^&*.,?]).+$/;
	if(!!password && password.length > 7 && password.length < 40 && regex.test(password)) {
		return true;
	}
	return false;
};

/**
 * Sets the account to deleted
 * @function setDeleted
 * @memberof User#
 * @name setDeleted
 * @returns {boolean} Whether the account was deleted
 */
User.methods.setDeleted = function() {
	this.deleted = true;
	return true;
};

/**
 * Checks if the given password matches the user's password
 * @function matchPassword
 * @memberof User#
 * @name matchPassword
 * @param {string} password - The password to match
 * @returns {boolean} Whether the password matches the user's password
 */
User.methods.matchPassword = function(password) {
	if(bcrypt.hashSync(password, this.password.salt) == this.password.encrypted) {
		return true;
	}
	return false;
};

/**
 * Generates and saves a login object
 * @function generateLogin
 * @memberof User#
 * @name generateLogin
 * @returns {string} - the user's auth token
 */
User.methods.generateLogin = function() {
	this.login = {};
	this.login.code = bcrypt.genSaltSync(10);
	this.login.timestamp = new Date();
	return when(this.save())
		.then(() => {
			var idObj = {'timestamp':this.login.timestamp};
			return this._id+"-"+ jwt.sign(idObj, this.login.code);
		})
		.otherwise(err => {
			throw err;
		});
};

/**
 * @function verifyLogin
 * @memberof User
 * @name verifyLogin
 * @returns {boolean|User} - user if valid, false otherwise
 */
User.statics.verifyLogin = function(tokenstr) {
	var tokenarr = tokenstr.split('-');
	var id = tokenarr[0];
	var token = tokenarr.slice(1).join('-');
	return when(User.findOne({_id: id}).exec())
		.then(user => {
			if(!user) {
				return false;
			}
			return when(jwt.verify(token, user.login.code))
				.then(decoded => {
      				if (!decoded || !decoded.timestamp) {
						return false;
					} else {
        				if(moment(decoded.timestamp).format() === moment(user.login.timestamp).format()) {
							return user;
						} else {
							return false;
						}
      				}
    			}); 
		})
		.otherwise(err => {
			return false;
		});
};

/**
 * Generates and saves an email verification object
 * @function generateEmailVerification
 * @memberof User#
 * @name generateEmailVerification
 * @returns {boolean} - if successfully updated
 */
User.methods.generateEmailVerification = function() {
	if(!this.verified.email) {
		this.verified.code = bcrypt.genSaltSync(10);
		return when(this.save());
	} else {
		return when(false);
	}
};

/**
 * Verifies an email and updates the account
 * @function verifyEmailVerification
 */ 
User.statics.verifyEmailVerification = function(email,code) {
	return when(User.findOne({email:email}).exec())
		.then(user => {
			if(!!user && user.verified.code === code) {
				user.verified.email = true;
				user.verified.code = '';
				return when(user.save());
			} else {
				return false;
			}
		});
};

/**
 * Resets an account's email verification to false
 * @function resetEmailVerification
 */
User.methods.resetEmailVerification = function() {
	this.verified.email = false;
	this.verified.code = '';
	return when(this.save());	
};

/**
 * Generates an account recovery code
 * @function generateAccountRecovery
 */
User.statics.generateAccountRecovery = function(email) {
	if(!!email) {
		return when(User.findOne({email:email}).exec())
			.then(user => {
				if(!!user && user.deleted) {
					user.recovery.field = 'deleted';
					user.recovery.code = bcrypt.genSaltSync(10);
					return when(user.save());
				} else {
					return when(false);
				}
			});
	} else {
		return when(false);
	}
};

/**
 * Verifies an account recovery code
 * @function verifyAccountRecovery
 */
User.statics.verifyAccountRecovery = function(email,code,password) {
	if(!!email && !!code && !!password) {
		return when(User.findOne({email:email}).exec())
			.then(user => {
				if(!!user && user.recovery.code === code) {
					return when(user.setPassword(password))
						.then(updated => {
							if(updated) {
								user.deleted = false;
								user.recovery.field = null;
								user.recovery.code = '';
								return when(user.save());
							} else {
								return when(false);
							}
						}).otherwise(err => {
							return when(false);
						});
				} else {
					return when(false);
				}
			});
	} else {
		return when(false);
	}
};

/**
 * Generates an account password recovery code
 * @function generatePasswordRecovery
 */
User.statics.generatePasswordRecovery = function(email) {
	if(!!email) {
		return when(User.findOne({email:email}).exec())
			.then(user => {
				if(!!user) {
					user.recovery.field = 'password';
					user.recovery.code = bcrypt.genSaltSync(10);
					return when(user.save());
				} else {
					return when(false);
				}
			});
	} else {
		return when(false);
	}
};

/**
 * Verifies an account password recovery code
 * @function verifyPasswordRecovery
 */
User.statics.verifyPasswordRecovery = function(email,code,password) {
	if(!!email && !!code && !!password) {
		return when(User.findOne({email:email}).exec())
			.then(user => {
				if(!!user && user.recovery.code === code) {
					return when(user.setPassword(password))
						.then(updated => {
							if(updated) {
								user.recovery.field = '';
								user.recovery.code = '';
								return when(user.save());
							} else {
								return when(false);
							}
						});
				} else {
					return when(false);
				}
			});
	} else {
		return when(false);
	}
};

// Create a model from the schema
User = mongoose.model('User', User);

var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var when = require('when');
var bcrypt = require('bcrypt');

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
	return when(this.checkName(name))
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
User.methods.checkName = function(name) {
	if(name) {
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
	return when(this.checkEmail(email))
		.then(valid => {
			if(valid) {
				this.email = email;
				return true;
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
User.methods.checkEmail = function(email) {
	if(email) {
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
	if(this.checkPassword(password)) {
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
User.methods.checkPassword = function(password) {
	if(password) {
		return true;
	}
	return false;
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
			var idObj = {'id':this._id};
			return this.name+"-"+ jwt.sign(idObj, this.login.code);
		})
		.otherwise(err => {
			console.log("ERROR",err);
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
	var name = tokenarr[0];
	var token = tokenarr.slice(1).join('-');
	return when(User.findOne({name: name}).exec())
		.then(user => {
			if(!user) {
				return false;
			}
			return when(jwt.verify(token, user.login.code))
				.then(decoded => {
      				if (!decoded || !decoded.id) {
					return false;
				} else {
        				if(decoded.id == user._id) {
						return user;
					} else {
						return false;
					}
      				}
    			}); 
		})
		.otherwise(err => {
			console.log("ERROR",err);
			return false;
		});
};

// Create a model from the schema
User = mongoose.model('User', User);

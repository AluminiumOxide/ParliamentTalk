var mongoose = require('mongoose');
var when = require('when');
var bcrypt = require('bcrypt');

var User = new mongoose.Schema({

	/** 
	 * The user name
	 * @property name
	 * @type string 
	 * @memberof User# 
	 */
	name: String,

	/** 
	 * The user's email
	 * @property email
	 * @type string 
	 * @memberof User# 
	 */
	email: String,

	/** 
	 * The user's password: {salt: string, encrypted: string}
	 * @property password 
	 * @type object
	 * @memberof User# 
	 */
	password: {
		salt: String,
		encrypted: String
	},


	/** 
	 * The user's verification info: {email: boolean, code: string}
	 * @property verified
	 * @type object
	 * @memberof User# 
	 */
	verified: {
		email: { 
			type: Boolean,
			default: false
		}, 
		code: String
	},

	/** 
	 * When the user was created
	 * @property created
	 * @type date 
	 * @memberof User# 
	 */
	created: Date,

	/**
	 * When the user was updated
	 * @property updated
	 * @type date
	 * @memberof User#
	 */
	updated: Date

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
		return User.count({'name':name})
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
 * @class
 * A model to represent user accounts
 */
User = mongoose.model('User', User);

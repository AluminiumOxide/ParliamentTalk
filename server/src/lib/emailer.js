'use strict';
var when = require('when');
var i18n = require('./i18n');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var instance = null;

module.exports.getInstance = function() {
	if(!!!instance) {
		instance = new emailer();
	}
	return instance;
};

function emailer() {
	this.env = null;
	this.transporter = null;

	this.config = function(env,cStr) {
		this.env = env;
		this.transporter = nodemailer.createTransport(smtpTransport(cStr));
	};
	
	this.composeSender = function() {
		return '"'+i18n.__('app_name')+'" <'+i18n.__('app_email')+'>';
	};
	
	this.composeRecipient = function(user) {
		if(this.env === "test" || this.env === null) {
			return '"'+i18n.__('app_name')+'" <'+i18n.__('app_email')+'>';
		} else {
			return '"'+user.name+'" <'+user.email+'>'
		}
	};
	
	this.composeTitle = function(emailType,user) {
		return i18n.__('email_title_'+emailType,user);
	};
	
	this.composeBody = function(emailType,user) {
		return i18n.__('email_body_'+emailType,user);
	};
	
	this.sendEmail = function(emailType,userId) {
		if(!!emailType && !!userId) {
			var User = mongoose.model('User');
			return when(User.findOne({_id: userId}).exec())
				.then(user => {
					if(!!user) {
						if(!!this.transporter) {
							var deferred = when.defer();
							try {
								this.transporter.sendMail({
									from: this.composeSender(),
									to: this.composeRecipient(user),
									subject: this.composeTitle(emailType,user),
									text: this.composeBody(emailType,user)
								},function(error,response){
									if(error) {
										console.error('email failure!',error);
										deferred.reject(false);
									} else {
										console.log('email "'+emailType+'" sent to "'+userId+'"');
										deferred.resolve(true);
									}
								});
							} catch(e) {
								deferred.resolve(false);
							}
							return deferred.promise;
						} else {
							console.warn('No transporter for email');
							return when(false);
						}
					} else {
						console.warn('No user found for '+userId);
						return when(false);
					}
				}).otherwise(err => {
					console.error("DATABASE ERROR!",err);
					return when(false);
				});
		} else {
			return when(false);
		}
	};
};

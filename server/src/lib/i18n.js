'use strict';
var i18n = require('i18n');

exports.configure = function() {
	i18n.configure({
		defaultLocale: 'en',
		locales:['en','fr'],
		directory: './i18n'
	});
};

exports.getInit = function() {
	this.configure();
	return i18n.init;
};

exports.__ = function(key) {
	this.configure();
	return i18n.__(key);
};

exports.getLocales = function() {
	this.configure();
	return i18n.getLocales();
};

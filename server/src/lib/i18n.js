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

exports.__ = function(key,obj) {
	this.configure();

	var catalog = i18n.getCatalog()[i18n.getLocale()]; 

	if(obj) {
		var cpy = Object.assign(obj.toObject(),catalog);
		return i18n.__(key,cpy);
	} else {
		return i18n.__(key,catalog);
	}
};

exports.getLocales = function() {
	this.configure();
	return i18n.getLocales();
};

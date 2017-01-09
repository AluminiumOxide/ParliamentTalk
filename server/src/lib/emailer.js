'use strict';
var when = require('when');

exports.sendEmail = function(emailType,userId) {

	console.log("*** SEND "+emailType+" EMAIL TO "+userId+" ***");
	return when(true);
	// TODO: Actually do something here

};

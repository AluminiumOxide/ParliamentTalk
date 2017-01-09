var when = require('when');
var assert = require('assert');
var sinon = require('sinon');
var emailer = require('../../../src/lib/emailer');

describe("Emailer", function() {

	/*** Pre-Save ***/
	context(".sendEmail", function() {

		var ctx = '';

		beforeEach(function() {
			ctx = sinon.sandbox.create();
		});
		afterEach(function() {
			ctx.restore();
		});

		it("should print out a comment and return a true promise", () => {
			return when(emailer.sendEmail('campaign','userid'))
				.then(r => {
					assert(r);
				});
		});

	});
});

var when = require('when');
var assert = require('assert');
var sinon = require('sinon');
var emailer = require('../../../src/lib/emailer');
require('../../../src/models/users');
var mongoose = require('mongoose');
var User = mongoose.model('User');

describe("Emailer", function() {

	/*** Pre-Save ***/
	context(".sendEmail", function() {

		var ctx = '';
		var emailerInst = '';

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			emailerInst = emailer.getInstance();
			emailerInst.config('test', require('../../../config/email').smtp);
		});
		afterEach(function() {
			ctx.restore();
		});

		it("should send emailVerify campaign email", () => {
			var user = new User();
			user.name = "TestyMcTestFace";
			user.email = "testymctestface@test.com";
			user.verified.code = "asdfadsfasdf";
			ctx.stub(User,'findOne',function(){return {exec:function(){return user;}}});
			return when(emailerInst.sendEmail('emailVerify',user._id))
				.then(r => {
					assert(r);
				});
		});

		it("should send accountRecovery campaign email", () => {
			var user = new User();
			user.name = "TestyMcTestFace";
			user.email = "testymctestface@test.com";
			user.recovery.code = "asdfadsfasdf";
			ctx.stub(User,'findOne',function(){return {exec:function(){return user;}}});
			return when(emailerInst.sendEmail('accountRecovery',user._id))
				.then(r => {
					assert(r);
				});
		});

		it("should send nameRecovery campaign email", () => {
			var user = new User();
			user.name = "TestyMcTestFace";
			user.email = "testymctestface@test.com";
			ctx.stub(User,'findOne',function(){return {exec:function(){return user;}}});
			return when(emailerInst.sendEmail('nameRecovery',user._id))
				.then(r => {
					assert(r);
				});
		});

		it("should send passwordRecovery campaign email", () => {
			var user = new User();
			user.name = "TestyMcTestFace";
			user.email = "testymctestface@test.com";
			user.recovery.code = "asdfadsfasdf";
			ctx.stub(User,'findOne',function(){return {exec:function(){return user;}}});
			return when(emailerInst.sendEmail('passwordRecovery',user._id))
				.then(r => {
					assert(r);
				});
		});

		it("should not send email, if user does not exist", () => {
			var user = new User();
			ctx.stub(User,'findOne',function(){return {exec:function(){return null;}}});
			return when(emailerInst.sendEmail('passwordRecovery',user._id))
				.then(r => {
					assert(!r);
				});
		});

		it("should not send email, if no user ID provided", () => {
			return when(emailerInst.sendEmail('passwordRecovery'))
				.then(r => {
					assert(!r);
				});
		});

	});
});

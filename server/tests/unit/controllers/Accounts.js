var mongoose = require('mongoose');
var when = require('when');
var assert = require('assert');
var sinon = require('sinon');
var bcrypt = require('bcrypt');
var moment = require('moment');
require('../../../src/models/users');

/*** Helper Functions ***/

// generate request
var genReq = function(data,head) {
	var req = {
		headers: head,
		body: data
	};
	return req;
};

// generate result
var genRes = function() {
	var res = {
		resData: null,
		statusCode: null
	};
	Object.bind(res);
	res.end = function(s) {
		this.resData = s;
	};
	return res;
};

// generate next
var genNext = function() {
	return function() { return; }
};

describe("Account", function() {
	
	var Account = require('../../../src/controllers/Accounts');
	var Authentication = require('../../../src/controllers/Authentication');
	var User = mongoose.model('User');

	/*** View ***/
	context(".view", function() {

		var ctx = '';
		var user = '';
		var UserMock = null;
		var UserFindOneStub = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			ctx.stub(User.prototype,'save',function(next) {return next();});
			UserMock = ctx.mock(User.prototype);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should view data", () => {
			var data1 = { 
				'name':'testy',
				'password':'passy'
			};
			var req1 = genReq(data1);
			var res1 = genRes();
			user = new User();
			UserFindOneStub = ctx.stub(User,'findOne',function(){
				return {exec: function(){return user;}}
			});
			UserMock.expects('matchPassword')
				.withArgs(data1.password)
				.returns(true);
			UserMock.expects('generateLogin')
				.returns('asdfasdf');
			ctx.stub(User,'verifyLogin',function(args) { 
				return user; 
			});
			return when(Authentication.signIn(req1, res1, genNext()))
				.then(() => {
					var req2 = genReq({},{'x-access-token':JSON.parse(res1.resData).token});
					var res2 = genRes();
					return when(Account.viewAccount(req2, res2, genNext()))
						.then(() => {
							assert.equal(res2.statusCode,200);
							assert.deepEqual(res2.resData,JSON.stringify(user));
						});
				});
		});

		it("should not view data with bad token", () => {
			var data1 = { 
				'name':'testy',
				'password':'passy'
			};
			var req1 = genReq(data1);
			var res1 = genRes();
			user = new User();
			UserFindOneStub = ctx.stub(User,'findOne',function(){
				return {exec: function(){return user;}}
			});
			UserMock.expects('matchPassword')
				.withArgs(data1.password)
				.returns(true);
			UserMock.expects('generateLogin')
				.returns('asdfasdf');
			ctx.stub(User,'verifyLogin',function(args) { 
				return false; 
			});
			return when(Authentication.signIn(req1, res1, genNext()))
				.then(() => {
					var req2 = genReq({},{'x-access-token':'bad'});
					var res2 = genRes();
					return when(Account.viewAccount(req2, res2, genNext()))
						.then(() => {
							assert.equal(res2.statusCode,400);
						});
				});
		});

		it("should not view data without login", () => {
			var data1 = { 
				'name':'testy',
				'password':'passy'
			};
			var req1 = genReq(data1);
			var res1 = genRes();
			user = new User();
			ctx.stub(User,'verifyLogin',function(args) { 
				return false; 
			});
			var req2 = genReq({},{});
			var res2 = genRes();
			return when(Account.viewAccount(req2, res2, genNext()))
				.then(() => {
					assert.equal(res2.statusCode,400);
				});
		});



	});

});

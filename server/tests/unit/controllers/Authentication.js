var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
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

describe("Authentication", function() {
	
	var Account = require('../../../src/controllers/Authentication');
	var User = mongoose.model('User');

	/*** Sign In ***/
	context(".signIn", function() {

		var ctx = '';
		var user = '';
		var UserFindOneStub = '';
		var UserSaveStub = '';

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			ctx.stub(User.prototype,'save',function(next){return next();});
			UserMock = ctx.mock(User.prototype);
			UserClassMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should sign in", () => {
			var data = { 
				'name':'testy',
				'password':'passy'
			};
			var req = genReq(data);
			var res = genRes();
			user = new User();
			UserFindOneStub = ctx.stub(User,'findOne',function(){
				return {exec: function(){return user;}}
			});
			UserMock
				.expects('matchPassword')
				.withArgs(data.password)
				.returns(true);
			UserMock
				.expects('generateLogin')
				.returns('asdfasdf');

			return when(Account.signIn(req, res, genNext()))
				.then(() => {
					assert.equal(res.statusCode,200);
					assert.equal(JSON.parse(res.resData).token,'asdfasdf');
				});
		});

		it("should not sign in with bad password", () => {
			var data = { 
				'name':'testy',
				'password':'badpassy'
			};
			var req = genReq(data);
			var res = genRes();
			user = new User();
			UserFindOneStub = ctx.stub(User,'findOne',function(){ 
				return {exec: function(){return user;}}
			});
			UserMock
				.expects('matchPassword')
				.withArgs(data.password)
				.returns(false);
			UserMock
				.expects('generateLogin')
				.returns('asdfasdf');

			return when(Account.signIn(req, res, genNext()))
				.then(() => {
					assert.equal(res.statusCode,400);
				});
		});

		it("should not sign in without a password", () => {
			var data = { 
				'name':'testy'
			};
			var req = genReq(data);
			var res = genRes();
			user = new User();
			UserFindOneStub = ctx.stub(User,'findOne',function(){ 
				return {exec: function(){return user;}}
			});
			UserMock
				.expects('matchPassword')
				.withArgs(data.password)
				.returns(false);
			UserMock
				.expects('generateLogin')
				.returns('asdfasdf');

			return when(Account.signIn(req, res, genNext()))
				.then(() => {
					assert.equal(res.statusCode,400);
				});
		});

		it("should not sign in with bad user name", () => {
			var data = { 
				'name':'badusername',
				'password':'passy'
			};
			var req = genReq(data);
			var res = genRes();
			user = new User();
			UserFindOneStub = ctx.stub(User,'findOne',function(){ 
				return {exec: function(){return;}}
			});
			UserMock
				.expects('matchPassword')
				.withArgs(data.password)
				.returns(false);
			UserMock
				.expects('generateLogin')
				.returns('asdfasdf');

			return when(Account.signIn(req, res, genNext()))
				.then(() => {
					assert.equal(res.statusCode,400);
				});
		});

		it("should not sign in without a user name", () => {
			var data = { 
				'password':'passy'
			};
			var req = genReq(data);
			var res = genRes();
			user = new User();
			UserFindOneStub = ctx.stub(User,'findOne',function(){ 
				return {exec: function(){return;}}
			});
			UserMock
				.expects('matchPassword')
				.withArgs(data.password)
				.returns(false);
			UserMock
				.expects('generateLogin')
				.returns('asdfasdf');

			return when(Account.signIn(req, res, genNext()))
				.then(() => {
					assert.equal(res.statusCode,400);
				});
		});

	});


	/*** Sign Out ***/
	context(".signOut", function() {

		var ctx = '';
		var user = '';

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			user = new User();

			UserMock = ctx.mock(User.prototype);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should sign out", () => {
			var data1 = { 
				'name':'testy',
				'password':'passy'
			};
			var req1 = genReq(data1);
			var res1 = genRes();
			ctx.stub(User,'findOne',function(args){ 
				return {exec: function(args){return user;}}
			});
			ctx.stub(User,'verifyLogin',function(args) { 
				return user; 
			});
			ctx.stub(User.prototype,'save',function(next) {
				return next();
			});
			ctx.stub(user,'save',function(){return;});
			UserMock
				.expects('matchPassword')
				.withArgs(data1.password)
				.returns(true);
			UserMock
				.expects('generateLogin')
				.returns('asdfasdf');

			return when(Account.signIn(req1, res1, genNext()))
				.then(() => {
					var req2 = genReq({},{'x-access-token':JSON.parse(res1.resData).token});
					var res2 = genRes();
					return when(Account.signOut(req2,res2,genNext()))
						.then(() => {
							assert.equal(res2.statusCode,200);
						});
				});
		});

		it("should not sign out with bad token", () => {
			var data1 = { 
				'name':'testy',
				'password':'passy'
			};
			var req1 = genReq(data1);
			var res1 = genRes();
			ctx.stub(User,'findOne',function(args){ 
				return {exec: function(args){return user;}}
			});
			ctx.stub(User,'verifyLogin',function(args) { 
				return; 
			});
			ctx.stub(User.prototype,'save',function(next) {
				return next();
			});
			ctx.stub(user,'save',function(){return;});
			UserMock
				.expects('matchPassword')
				.withArgs(data1.password)
				.returns(true);
			UserMock
				.expects('generateLogin')
				.returns('asdfasdf');

			return when(Account.signIn(req1, res1, genNext()))
				.then(() => {
					var req2 = genReq({},{'x-access-token':'badtoken'});
					var res2 = genRes();
					return when(Account.signOut(req2,res2,genNext()))
						.then(() => {
							assert.equal(res2.statusCode,400);
						});
				});
		});

		it("should not sign out without a token", () => {
			var data1 = { 
				'name':'testy',
				'password':'passy'
			};
			var req1 = genReq(data1);
			var res1 = genRes();
			ctx.stub(User,'findOne',function(args){ 
				return {exec: function(args){return user;}}
			});
			ctx.stub(User,'verifyLogin',function(args) { 
				return user; 
			});
			ctx.stub(User.prototype,'save',function(next) {
				return next();
			});
			ctx.stub(user,'save',function(){return;});
			UserMock
				.expects('matchPassword')
				.withArgs(data1.password)
				.returns(true);
			UserMock
				.expects('generateLogin')
				.returns('asdfasdf');

			return when(Account.signIn(req1, res1, genNext()))
				.then(() => {
					var req2 = genReq({},{});
					var res2 = genRes();
					return when(Account.signOut(req2,res2,genNext()))
						.then(() => {
							assert.equal(res2.statusCode,400);
						});
				});
		});

		it("should not sign out without a prior login", () => {
			var req1 = genReq({},{});
			var res1 = genRes();
			return when(Account.signOut(req1,res1,genNext()))
				.then(() => {
					assert.equal(res1.statusCode,400);
				});
		});
	});
});

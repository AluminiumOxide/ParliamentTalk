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

	/*** Create ***/
	context(".create", function() {

		var ctx = '';

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			ctx.stub(User.prototype,'save',function(next) {return next();});
			UserMock = ctx.mock(User.prototype);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should create account", () => {
			var data = { 
				'name':'testy',
				'email':'test@testy.com',
				'password':'passy'
			};
			var req = genReq(data);
			var res = genRes();
			UserMock
				.expects('setName')
				.withArgs(data.name)
				.returns(true);
			UserMock
				.expects('setEmail')
				.withArgs(data.email)
				.returns(true);
			UserMock
				.expects('setPassword')
				.withArgs(data.password)
				.returns(true);
			return when(Account.createAccount(req, res, genNext()))
				.then(() => {
					assert.equal(res.statusCode,201);
				});
		});

		it("should not create account without name", () => {
			var data = { 
				'name':'',
				'email':'test@testy.com',
				'password':'passy'
			};
			var req = genReq(data);
			var res = genRes();
			UserMock
				.expects('setName')
				.withArgs(data.name)
				.returns(false);
			UserMock
				.expects('setEmail')
				.withArgs(data.email)
				.returns(true);
			UserMock
				.expects('setPassword')
				.withArgs(data.password)
				.returns(true);
			return when(Account.createAccount(req, res, genNext()))
				.then(() => {
					assert.equal(res.statusCode,400);
					assert.equal(JSON.parse(res.resData).field,'name');
					assert.equal(JSON.parse(res.resData).error,'Invalid user name');
				});
		});

		it("should not create account without email", () => {
			var data = { 
				'name':'testy',
				'email':'',
				'password':'passy'
			};
			var req = genReq(data);
			var res = genRes();
			UserMock
				.expects('setName')
				.withArgs(data.name)
				.returns(true);
			UserMock
				.expects('setEmail')
				.withArgs(data.email)
				.returns(false);
			UserMock
				.expects('setPassword')
				.withArgs(data.password)
				.returns(true);
			return when(Account.createAccount(req, res, genNext()))
				.then(() => {
					assert.equal(res.statusCode,400);
					assert.equal(JSON.parse(res.resData).field,'email');
					assert.equal(JSON.parse(res.resData).error,'Invalid email');
				});
		});

		it("should not create account without password", () => {
			var data = { 
				'name':'testy',
				'email':'test@testy.com',
				'password':''
			};
			var req = genReq(data);
			var res = genRes();
			UserMock
				.expects('setName')
				.withArgs(data.name)
				.returns(true);
			UserMock
				.expects('setEmail')
				.withArgs(data.email)
				.returns(true);
			UserMock
				.expects('setPassword')
				.withArgs(data.password)
				.returns(false);
			return when(Account.createAccount(req, res, genNext()))
				.then(() => {
					assert.equal(res.statusCode,400);
					assert.equal(JSON.parse(res.resData).field,'password');
					assert.equal(JSON.parse(res.resData).error,'Invalid password');
				});
		});
	});


	/*** Update ***/
	context(".update", function() {

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

		it("should update all data", () => {
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
					var data2 = {
						'name':'testy1',
						'email':'testy1@test.com',
						'password':'passy1'
					};
					var req2 = genReq(data2,{'x-access-token':JSON.parse(res1.resData).token});
					var res2 = genRes();
					var userMock = ctx.mock(user);
					userMock.expects('setName')
						.withArgs(data2.name)
						.returns(true);
					userMock.expects('setEmail')
						.withArgs(data2.email)
						.returns(true);
					userMock.expects('setPassword')
						.withArgs(data2.password)
					 	.returns(true);
					return when(Account.updateAccount(req2, res2, genNext()))
						.then(() => {
							assert.equal(res2.statusCode,200);
						});
				});
		});
		it("should update only name", () => {
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
					var data2 = {
						'name':'testy1'
					};
					var req2 = genReq(data2,{'x-access-token':JSON.parse(res1.resData).token});
					var res2 = genRes();
					var userMock = ctx.mock(user);
					userMock.expects('setName')
						.withArgs(data2.name)
						.returns(true);
					return when(Account.updateAccount(req2, res2, genNext()))
						.then(() => {
							assert.equal(res2.statusCode,200);
						});
				});
		});
		it("should update only email", () => {
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
					var data2 = {
						'email':'testy1@test.com'
					};
					var req2 = genReq(data2,{'x-access-token':JSON.parse(res1.resData).token});
					var res2 = genRes();
					var userMock = ctx.mock(user);
					userMock.expects('setEmail')
						.withArgs(data2.email)
						.returns(true);
					return when(Account.updateAccount(req2, res2, genNext()))
						.then(() => {
							assert.equal(res2.statusCode,200);
						});
				});
		});
		it("should update only password", () => {
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
					var data2 = {
						'password':'passy1'
					};
					var req2 = genReq(data2,{'x-access-token':JSON.parse(res1.resData).token});
					var res2 = genRes();
					var userMock = ctx.mock(user);
					userMock.expects('setPassword')
						.withArgs(data2.password)
					 	.returns(true);
					return when(Account.updateAccount(req2, res2, genNext()))
						.then(() => {
							assert.equal(res2.statusCode,200);
						});
				});
		});
		it("should update only name and email", () => {
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
					var data2 = {
						'name':'testy1',
						'email':'testy1@test.com'
					};
					var req2 = genReq(data2,{'x-access-token':JSON.parse(res1.resData).token});
					var res2 = genRes();
					var userMock = ctx.mock(user);
					userMock.expects('setName')
						.withArgs(data2.name)
						.returns(true);
					userMock.expects('setEmail')
						.withArgs(data2.email)
						.returns(true);
					return when(Account.updateAccount(req2, res2, genNext()))
						.then(() => {
							assert.equal(res2.statusCode,200);
						});
				});
		});
		it("should update only name and password", () => {
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
					var data2 = {
						'name':'testy1',
						'password':'passy1'
					};
					var req2 = genReq(data2,{'x-access-token':JSON.parse(res1.resData).token});
					var res2 = genRes();
					var userMock = ctx.mock(user);
					userMock.expects('setName')
						.withArgs(data2.name)
						.returns(true);
					userMock.expects('setPassword')
						.withArgs(data2.password)
					 	.returns(true);
					return when(Account.updateAccount(req2, res2, genNext()))
						.then(() => {
							assert.equal(res2.statusCode,200);
						});
				});
		});
		it("should update only email and password", () => {
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
					var data2 = {
						'email':'testy1@test.com',
						'password':'passy1'
					};
					var req2 = genReq(data2,{'x-access-token':JSON.parse(res1.resData).token});
					var res2 = genRes();
					var userMock = ctx.mock(user);
					userMock.expects('setEmail')
						.withArgs(data2.email)
						.returns(true);
					userMock.expects('setPassword')
						.withArgs(data2.password)
					 	.returns(true);
					return when(Account.updateAccount(req2, res2, genNext()))
						.then(() => {
							assert.equal(res2.statusCode,200);
						});
				});
		});
		it("should not update with bad token", () => {
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
					ctx.restore();
					ctx.stub(User,'verifyLogin',function(args) { 
						return null; 
					});
					var data2 = {
						'name':'testy1',
						'email':'testy1@test.com',
						'password':'passy1'
					};
					var req2 = genReq(data2,{'x-access-token':'badtoken'});
					var res2 = genRes();
					return when(Account.updateAccount(req2, res2, genNext()))
						.then(() => {
							assert.equal(res2.statusCode,400);
						});
				});
		});
		it("should not update with empty token", () => {
 			var data2 = {
 				'name':'testy1',
 				'email':'testy1@test.com',
 				'password':'passy1'
 			};
 			var req2 = genReq(data2,{'x-access-token':''});
 			var res2 = genRes();
 			return when(Account.updateAccount(req2, res2, genNext()))
 				.then(() => {
 					assert.equal(res2.statusCode,400);
 				});
 		});
		it("should not update without login", () => {
 			var data2 = {
 				'name':'testy1',
 				'email':'testy1@test.com',
 				'password':'passy1'
 			};
 			var req2 = genReq(data2);
 			var res2 = genRes();
 			return when(Account.updateAccount(req2, res2, genNext()))
 				.then(() => {
 					assert.equal(res2.statusCode,400);
 				});
 		});
	});

	/*** Delete ***/
	context(".delete", function() {

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

		it("should set the user to deleted", () => {
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
					var userMock = ctx.mock(user);
					userMock.expects('setDeleted')
						.returns(true);
					return when(Account.deleteAccount(req2, res2, genNext()))
						.then(() => {
							assert.equal(res2.statusCode,200);
						});
				});
		});

		it("should not delete the user with a bad token", () => {
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
					var req2 = genReq({},{'x-access-token':'badtoken'});
					var res2 = genRes();
					return when(Account.deleteAccount(req2, res2, genNext()))
						.then(() => {
							assert.equal(res2.statusCode,400);
						});
				});
		});

		it("should not delete the user with empty token", () => {
			var req2 = genReq({},{'x-access-token':''});
			var res2 = genRes();
			return when(Account.deleteAccount(req2, res2, genNext()))
				.then(() => {
					assert.equal(res2.statusCode,400);
				});
		});

		it("should not delete the user without login", () => {
			var req2 = genReq({},{});
			var res2 = genRes();
			return when(Account.deleteAccount(req2, res2, genNext()))
				.then(() => {
					assert.equal(res2.statusCode,400);
				});
		});

	});

	context(".checkName", function() {

		var ctx = '';
		var user = '';
		var UserMock = null;
		var UserFindOneStub = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			ctx.stub(User.prototype,'save',function(next) {return next();});
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should approve a potential name", () => {
			var req1 = genReq(JSON.stringify('somethingunique'),{});
			var res1 = genRes();
			UserMock.expects('count').returns(0);
			return when(Account.checkName(req1, res1, genNext()))
				.then(() => {
					assert(JSON.parse(res1.resData));
				});
		});

		it("should not approve a duplicate potential name", () => {
			var req1 = genReq(JSON.stringify('somethingnotunique'),{});
			var res1 = genRes();
			UserMock.expects('count').returns(1);
			return when(Account.checkName(req1, res1, genNext()))
				.then(() => {
					assert(!JSON.parse(res1.resData));
				});
		});

		it("should not approve an empty potential name", () => {
			var req1 = genReq('',{});
			var res1 = genRes();
			return when(Account.checkName(req1, res1, genNext()))
				.then(() => {
					assert(!JSON.parse(res1.resData));
				});
		});

	}); 
	context(".checkEmail", function() {

		var ctx = '';
		var user = '';
		var UserMock = null;
		var UserFindOneStub = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			ctx.stub(User.prototype,'save',function(next) {return next();});
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should approve a potential email", () => {
			var req1 = genReq(JSON.stringify('somethingunique@testy.com'),{});
			var res1 = genRes();
			UserMock.expects('count').returns(when(0));
			return when(Account.checkEmail(req1, res1, genNext()))
				.then(() => {
					assert(JSON.parse(res1.resData));
				});
		});

		it("should not approve a duplicate potential email", () => {
			var req1 = genReq(JSON.stringify('testy@test.com'),{});
			var res1 = genRes();
			UserMock.expects('count').returns(when(1));
			return when(Account.checkEmail(req1, res1, genNext()))
				.then(() => {
					assert(!JSON.parse(res1.resData));
				});
		});

		it("should not approve an empty potential email", () => {
			var req1 = genReq('',{});
			var res1 = genRes();
			return when(Account.checkEmail(req1, res1, genNext()))
				.then(() => {
					assert(!JSON.parse(res1.resData));
				});
		});

	}); 
	context(".checkPassword", function() {

		var ctx = '';
		var user = '';
		var UserMock = null;
		var UserFindOneStub = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			ctx.stub(User.prototype,'save',function(next) {return next();});
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should approve a potential password", () => {
			var req1 = genReq(JSON.stringify('asdfasdfasdfasdf'),{});
			var res1 = genRes();
			UserMock.expects('count').returns(0);
			return when(Account.checkPassword(req1, res1, genNext()))
				.then(() => {
					assert(JSON.parse(res1.resData));
				});
		});
		it("should not approve an empty potential password", () => {
			var req1 = genReq('',{});
			var res1 = genRes();
			return when(Account.checkPassword(req1, res1, genNext()))
				.then(() => {
					assert(!JSON.parse(res1.resData));
				});
		});

	});
	context(".verifyEmail", function() {

		context("1st request", function() {

			var ctx = '';
			var user = '';
			var UserMock = null;
			var UserFindOneStub = null;
	
			beforeEach(function() {
				ctx = sinon.sandbox.create();
				ctx.stub(User.prototype,'save',function(next) {return next();});
				UserMock = ctx.mock(User);
			});
	
			afterEach(function() {
				ctx.restore();
			});
	
			it("should verify email", () => {
				var req = genReq({},{'x-access-token':'asdfasdf'});
				var res = genRes();
				ctx.stub(User.prototype,'generateEmailVerification',function() { return true; });	
				user = new User();
				ctx.stub(User,'verifyLogin',function() { return user; });
				return when(Account.verifyEmail(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),true);
						assert.equal(res.statusCode,200);
					});
			});
	
			it("should not verify without valid login", () => {
				var req = genReq({},{'x-access-token':'asdfasdf'});
				var res = genRes();
				ctx.stub(User,'verifyLogin',function() { return when.reject(); });
				return when(Account.verifyEmail(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,400);
					});
			});

			it("should not verify without an access token", () => {
				var req = genReq({},{});
				var res = genRes();
				ctx.stub(User,'verifyLogin',function() { return when.reject(); });
				return when(Account.verifyEmail(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,400);
					});
			});

			it("should not verify email, if it has already been verified", () => {
				var req = genReq({},{'x-access-token':'asdfasdf'});
				var res = genRes();
				ctx.stub(User.prototype,'generateEmailVerification',function() { return false; });	
				user = new User();
				ctx.stub(User,'verifyLogin',function() { return user; });
				return when(Account.verifyEmail(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

		});

		context("2nd request", function() {

			var ctx = '';
			var user = '';
			var UserMock = null;
			var UserFindOneStub = null;
	
			beforeEach(function() {
				ctx = sinon.sandbox.create();
				ctx.stub(User.prototype,'save',function(next) {return next();});
				user = new User();
				UserMock = ctx.mock(User);
			});
	
			afterEach(function() {
				ctx.restore();
			});
	
			it("should verify email", () => {
				var req = genReq({'email':'testy@test.com','verificationCode':'testtest'},{});
				var res = genRes();
				ctx.stub(User,'verifyEmailVerification',function(){return true;});
				return when(Account.verifyEmail(req,res,genNext()))
					.then(() => {
						assert(JSON.parse(res.resData));
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify email, if bad email provided", () => {
				var req = genReq({'email':'bademail@test.com','verificationCode':'testtest'},{});
				var res = genRes();
				ctx.stub(User,'verifyEmailVerification',function(){return false;});
				return when(Account.verifyEmail(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify email, if no email provided", () => {
				var req = genReq({'email':'','verificationCode':'testtest'},{});
				var res = genRes();
				return when(Account.verifyEmail(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify email, if bad code provided", () => {
				var req = genReq({'email':'testy@test.com','verificationCode':'badcode'},{});
				var res = genRes();
				ctx.stub(User,'verifyEmailVerification',function(){return false;});
				return when(Account.verifyEmail(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify email, if no code provided", () => {
				var req = genReq({'email':'testy@test.com','verificationCode':''},{});
				var res = genRes();
				return when(Account.verifyEmail(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

		});

	});
 
	describe('.recoverDeleted', () => {

		describe('1st Request', () => {

			var ctx = '';
			var user = '';
			var UserMock = null;
			var UserFindOneStub = null;
	
			beforeEach(function() {
				ctx = sinon.sandbox.create();
				ctx.stub(User.prototype,'save',function(next) {return next();});
				user = new User();
				UserMock = ctx.mock(User);
			});
	
			afterEach(function() {
				ctx.restore();
			});

			it("should generate account recovery", () => {
				var req = genReq({'email':'testy@test.com'},{});
				var res = genRes();
				ctx.stub(User,'generateAccountRecovery',function(){return true;});
				return when(Account.recoverDeleted(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),true);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not generate account recovery, if no email provided", () => {
				var req = genReq({},{});
				var res = genRes();
				return when(Account.recoverDeleted(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not generate account recovery, if bad email provided", () => {
				var req = genReq({'email':'testy@test.com'},{});
				var res = genRes();
				ctx.stub(User,'generateAccountRecovery',function(){return false;});
				return when(Account.recoverDeleted(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});
		});

		describe('2nd Request', () => {

			var ctx = '';
			var user = '';
			var UserMock = null;
			var UserFindOneStub = null;
	
			beforeEach(function() {
				ctx = sinon.sandbox.create();
				ctx.stub(User.prototype,'save',function(next) {return next();});
				user = new User();
				UserMock = ctx.mock(User);
			});
	
			afterEach(function() {
				ctx.restore();
			});

			it("should verify account recovery", () => {
				var req = genReq({'email':'testy@test.com','code':'asdf','password':'asdf'},{});
				var res = genRes();
				ctx.stub(User,'verifyAccountRecovery',function(){return true;});
				return when(Account.recoverDeleted(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),true);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify account recovery, if no email provided", () => {
				var req = genReq({'code':'asdf','password':'asdf'},{});
				var res = genRes();
				return when(Account.recoverDeleted(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify account recovery, if bad email provided", () => {
				var req = genReq({'email':'bad@email.com','code':'asdf','password':'asdf'},{});
				var res = genRes();
				ctx.stub(User,'verifyAccountRecovery',function(){return false;});
				return when(Account.recoverDeleted(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify account recovery, if no code provided", () => {
				var req = genReq({'email':'testy@test.com','password':'asdf'},{});
				var res = genRes();
				return when(Account.recoverDeleted(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify account recovery, if bad code provided", () => {
				var req = genReq({'email':'bad@email.com','code':'badcode','password':'asdf'},{});
				var res = genRes();
				ctx.stub(User,'verifyAccountRecovery',function(){return false;});
				return when(Account.recoverDeleted(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify account recovery, if no password provided", () => {
				var req = genReq({'email':'testy@test.com','code':'asdf'},{});
				var res = genRes();
				return when(Account.recoverDeleted(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify account recovery, if bad password provided", () => {
				var req = genReq({'email':'testy@test.com','code':'asdf','password':''},{});
				var res = genRes();
				ctx.stub(User,'verifyAccountRecovery',function(){return false;});
				return when(Account.recoverDeleted(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});			
		});
	});

	describe('.recoverUsername', () => {
		var ctx = '';
		var user = '';
		var UserMock = null;
		var UserFindOneStub = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			ctx.stub(User.prototype,'save',function(next) {return next();});
			user = new User();
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should send username recovery email", () => {
			var req = genReq({'email':'testy@test.com'})
			var res = genRes();
			user = new User();
			UserFindOneStub = ctx.stub(User,'findOne',function(){
				return {exec: function(){return user;}}
			});
			return when(Account.recoverUsername(req,res,genNext()))
				.then(() => {
					assert.equal(JSON.parse(res.resData),true);
					assert.equal(res.statusCode,200);
				});
		});

		it("should not send username recovery email, if no email provided", () => {
			var req = genReq({})
			var res = genRes();
			user = new User();
			return when(Account.recoverUsername(req,res,genNext()))
				.then(() => {
					assert.equal(JSON.parse(res.resData),false);
					assert.equal(res.statusCode,200);
				});
		});

		it("should not send username recovery email, if bad email provided", () => {
			var req = genReq({'email':'bad.email@test.com'})
			var res = genRes();
			UserFindOneStub = ctx.stub(User,'findOne',function(){
				return {exec: function(){return null;}}
			});
			return when(Account.recoverUsername(req,res,genNext()))
				.then(() => {
					assert.equal(JSON.parse(res.resData),false);
					assert.equal(res.statusCode,200);
				});
		}); 
	});

	describe('.recoverPassword', () => {

		describe('1st Request', () => {

			var ctx = '';
			var user = '';
			var UserMock = null;
			var UserFindOneStub = null;
	
			beforeEach(function() {
				ctx = sinon.sandbox.create();
				ctx.stub(User.prototype,'save',function(next) {return next();});
				user = new User();
				UserMock = ctx.mock(User);
			});
	
			afterEach(function() {
				ctx.restore();
			});

			it("should generate password recovery", () => {
				var req = genReq({'email':'testy@test.com'},{});
				var res = genRes();
				ctx.stub(User,'generatePasswordRecovery',function(){return true;});
				return when(Account.recoverPassword(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),true);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not generate password recovery, if no email provided", () => {
				var req = genReq({},{});
				var res = genRes();
				return when(Account.recoverPassword(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not generate password recovery, if bad email provided", () => {
				var req = genReq({'email':'testy@test.com'},{});
				var res = genRes();
				ctx.stub(User,'generatePasswordRecovery',function(){return false;});
				return when(Account.recoverPassword(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});
		});

		describe('2nd Request', () => {

			var ctx = '';
			var user = '';
			var UserMock = null;
			var UserFindOneStub = null;
	
			beforeEach(function() {
				ctx = sinon.sandbox.create();
				ctx.stub(User.prototype,'save',function(next) {return next();});
				user = new User();
				UserMock = ctx.mock(User);
			});
	
			afterEach(function() {
				ctx.restore();
			});

			it("should verify password recovery", () => {
				var req = genReq({'email':'testy@test.com','code':'asdf','password':'asdf'},{});
				var res = genRes();
				ctx.stub(User,'verifyPasswordRecovery',function(){return true;});
				return when(Account.recoverPassword(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),true);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify password recovery, if no email provided", () => {
				var req = genReq({'code':'asdf','password':'asdf'},{});
				var res = genRes();
				return when(Account.recoverPassword(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify password recovery, if bad email provided", () => {
				var req = genReq({'email':'bad@email.com','code':'asdf','password':'asdf'},{});
				var res = genRes();
				ctx.stub(User,'verifyPasswordRecovery',function(){return false;});
				return when(Account.recoverPassword(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify password recovery, if no code provided", () => {
				var req = genReq({'email':'testy@test.com','password':'asdf'},{});
				var res = genRes();
				return when(Account.recoverPassword(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify password recovery, if bad code provided", () => {
				var req = genReq({'email':'bad@email.com','code':'badcode','password':'asdf'},{});
				var res = genRes();
				ctx.stub(User,'verifyPasswordRecovery',function(){return false;});
				return when(Account.recoverPassword(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify password recovery, if no password provided", () => {
				var req = genReq({'email':'testy@test.com','code':'asdf'},{});
				var res = genRes();
				return when(Account.recoverPassword(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});

			it("should not verify password recovery, if bad password provided", () => {
				var req = genReq({'email':'testy@test.com','code':'asdf','password':''},{});
				var res = genRes();
				ctx.stub(User,'verifyPasswordRecovery',function(){return false;});
				return when(Account.recoverPassword(req,res,genNext()))
					.then(() => {
						assert.equal(JSON.parse(res.resData),false);
						assert.equal(res.statusCode,200);
					});
			});			
		});
	});
});

var mongoose = require('mongoose');
var when = require('when');
var assert = require('assert');
var sinon = require('sinon');
var bcrypt = require('bcrypt');
var moment = require('moment');
require('../../src/models/users');

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
		resData: { status: '', json: {}}
	};
	Object.bind(res);
	res.status = function(s) {
		var that = this;
		return {
			json: function(o) {
				that.resData.status = s;
				that.resData.json = o;
				return;
			}
		}
	};
	return res;
};


describe("Account", function() {
	
	var Account = require('../../src/controllers/accounts');
	var User = mongoose.model('User');

	/*** Sign Up ***/
	context(".signUp", function() {

		var ctx = '';

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			ctx.stub(User.prototype,'save',function(next) {return next();});
			UserMock = ctx.mock(User.prototype);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should sign up", () => {
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
			return when(Account.signUp(req, res))
				.then(() => {
					assert.equal(res.resData.status,201);
					assert.equal(Object.keys(res.resData.json).length,0);
				});
		});

		it("should not sign up without name", () => {
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
			return when(Account.signUp(req, res))
				.then(() => {
					assert.equal(res.resData.status,400);
					assert.equal(res.resData.json.field,'name');
					assert.equal(res.resData.json.error,'Invalid user name');
				});
		});

		it("should not sign up without email", () => {
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
			return when(Account.signUp(req, res))
				.then(() => {
					assert.equal(res.resData.status,400);
					assert.equal(res.resData.json.field,'email');
					assert.equal(res.resData.json.error,'Invalid email');
				});
		});

		it("should not sign up without password", () => {
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
			return when(Account.signUp(req, res))
				.then(() => {
					assert.equal(res.resData.status,400);
					assert.equal(res.resData.json.field,'password');
					assert.equal(res.resData.json.error,'Invalid password');
				});
		});
	});

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

			return when(Account.signIn(req, res))
				.then(() => {
					assert.equal(res.resData.status,201);
					assert.equal(res.resData.json.token,'asdfasdf');
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

			return when(Account.signIn(req, res))
				.then(() => {
					assert.equal(res.resData.status,400);
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

			return when(Account.signIn(req, res))
				.then(() => {
					assert.equal(res.resData.status,400);
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

			return when(Account.signIn(req, res))
				.then(() => {
					assert.equal(res.resData.status,400);
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

			return when(Account.signIn(req, res))
				.then(() => {
					assert.equal(res.resData.status,400);
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

			return when(Account.signIn(req1, res1))
				.then(() => {
					var req2 = genReq({},{'x-access-token':res1.resData.json.token});
					var res2 = genRes();
					return when(Account.signOut(req2,res2))
						.then(() => {
							assert.equal(res2.resData.status,201);
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

			return when(Account.signIn(req1, res1))
				.then(() => {
					var req2 = genReq({},{'x-access-token':'badtoken'});
					var res2 = genRes();
					return when(Account.signOut(req2,res2))
						.then(() => {
							assert.equal(res2.resData.status,400);
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

			return when(Account.signIn(req1, res1))
				.then(() => {
					var req2 = genReq({},{});
					var res2 = genRes();
					return when(Account.signOut(req2,res2))
						.then(() => {
							assert.equal(res2.resData.status,400);
						});
				});
		});

		it("should not sign out without a prior login", () => {
			var req1 = genReq({},{});
			var res1 = genRes();
			return when(Account.signOut(req1,res1))
				.then(() => {
					assert.equal(res1.resData.status,400);
				});
		});
	});

});

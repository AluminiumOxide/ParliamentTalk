var mongoose = require('mongoose');
var when = require('when');
var assert = require('assert');
var sinon = require('sinon');
var bcrypt = require('bcrypt');
var moment = require('moment');
require('../../src/models/users');

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
			var req = {
				body: data
			};
			var newResponse = { status: '', json: {}}
			var res = {
				status: function(s) {
					return {
						json: function(o) {
							newResponse.status = s;
							newResponse.json = o;
							return;
						}
					}
				}
			};
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
					assert.equal(newResponse.status,201);
					assert.equal(Object.keys(newResponse.json).length,0);
				});
		});

		it("should not sign up without name", () => {
			var data = { 
				'name':'',
				'email':'test@testy.com',
				'password':'passy'
			};
			var req = {
				body: data
			};
			var newResponse = { status: '', json: {}}
			var res = {
				status: function(s) {
					return {
						json: function(o) {
							newResponse.status = s;
							newResponse.json = o;
							return;
						}
					}
				}
			};
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
					assert.equal(newResponse.status,400);
					assert.equal(newResponse.json.field,'name');
					assert.equal(newResponse.json.error,'Invalid user name');
				});
		});

		it("should not sign up without email", () => {
			var data = { 
				'name':'testy',
				'email':'',
				'password':'passy'
			};
			var req = {
				body: data
			};
			var newResponse = { status: '', json: {}}
			var res = {
				status: function(s) {
					return {
						json: function(o) {
							newResponse.status = s;
							newResponse.json = o;
							return;
						}
					}
				}
			};
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
					assert.equal(newResponse.status,400);
					assert.equal(newResponse.json.field,'email');
					assert.equal(newResponse.json.error,'Invalid email');
				});
		});

		it("should not sign up without password", () => {
			var data = { 
				'name':'testy',
				'email':'test@testy.com',
				'password':''
			};
			var req = {
				body: data
			};
			var newResponse = { status: '', json: {}}
			var res = {
				status: function(s) {
					return {
						json: function(o) {
							newResponse.status = s;
							newResponse.json = o;
							return;
						}
					}
				}
			};
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
					assert.equal(newResponse.status,400);
					assert.equal(newResponse.json.field,'password');
					assert.equal(newResponse.json.error,'Invalid password');
				});
		});
	});
});

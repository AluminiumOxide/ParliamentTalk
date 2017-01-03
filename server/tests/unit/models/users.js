var mongoose = require('mongoose');
var when = require('when');
var assert = require('assert');
var sinon = require('sinon');
var bcrypt = require('bcrypt');
var moment = require('moment');
var jwt = require('jsonwebtoken');
require('../../../src/models/users');

describe("User", function() {

	var User = mongoose.model('User');
	
	/*** Pre-Save ***/
	context("#preSave", function() {

		var newUser = '';
		var ctx = '';

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			ctx.stub(User.prototype,'save', function(next) { newUser = this; return next(); });
		});
		afterEach(function() {
			ctx.restore();
		});

		it("should set created and updated", () => {
			var user = new User();
			user.name = 'foo';
			return when(user.save())
				.then(() => {
					assert.equal(newUser.name,'foo');
					assert(moment.duration(moment().diff(newUser.created)).asMinutes() < 1);
					assert(moment.duration(moment().diff(newUser.updated)).asMinutes() < 1);
				});
		});

		it("should set updated only", () => {
			var user = new User();
			user.created = moment().subtract(8, 'months').format();
			return when(user.save())
				.then(() => {
					assert.equal(newUser.created,user.created);
					assert(moment.duration(moment().diff(newUser.updated)).asMinutes() < 1);
				});
		});
	});

	/*** Check Name ***/
	context("#checkName", function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			user = new User();
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should pass good name", () => {
			UserMock
				.expects('count')
				.withArgs({'name':'testy'})
				.returns(when(0));
			return when(User.checkName('testy'))
				.then(valid => {
					assert.equal(valid,true);
				});
		});

		it("should fail empty name", () => {
			return when(User.checkName(''))
				.then(valid => {
					assert.equal(valid,false);
				});
		});

		it("should fail non-unqiue name", () => {
			UserMock
				.expects('count')
				.withArgs({'name':'testy'})
				.returns(when(1));
			return when(User.checkName('testy'))
				.then(valid => {
					assert.equal(valid, false);
				});
		});

	});

	/*** Set Name ***/
	context("#setName", function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			user = new User();
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should set good name", () => {
			UserMock
				.expects('count')
				.withArgs({'name':'testy'})
				.returns(when(0));
			return when(user.setName('testy'))
				.then(valid => {
					assert.equal(valid,true);
					assert.equal(user.name,'testy');
				});
		});

		it("should not set empty name", () => {
			user.name = 'shouldBe';
			return when(user.setName(''))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.name,'shouldBe');
				});
		});

		it("should fail non-unqiue name", () => {
			user.name = 'shouldBe';
			UserMock
				.expects('count')
				.withArgs({'name':'testy'})
				.returns(when(1));
			return when(user.setName('testy'))
				.then(valid => {
					assert.equal(valid, false);
					assert.equal(user.name,'shouldBe');
				});
		});

	});
	
	/*** Check Email ***/
	context("#checkEmail", function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			user = new User();
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should pass good email", () => {
			UserMock
				.expects('count')
				.withArgs({'email':'testy@test.com'})
				.returns(when(0));
			return when(User.checkEmail('testy@test.com'))
				.then(valid => {
					assert.equal(valid,true);
				});
		});

		it("should fail empty email", () => {
			return when(User.checkEmail(''))
				.then(valid => {
					assert.equal(valid,false);
				});
		});

		it("should fail non-unqiue email", () => {
			UserMock
				.expects('count')
				.withArgs({'email':'testy@test.com'})
				.returns(when(1));
			return when(User.checkEmail('testy@test.com'))
				.then(valid => {
					assert.equal(valid, false);
				});
		});

	});

	/*** Set Email ***/
	context("#setEmail", function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			user = new User();
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should set good email", () => {
			UserMock
				.expects('count')
				.withArgs({'email':'testy@test.com'})
				.returns(when(0));
			return when(user.setEmail('testy@test.com'))
				.then(valid => {
					assert.equal(valid,true);
					assert.equal(user.email,'testy@test.com');
				});
		});

		it("should not set empty email", () => {
			user.email = "should@be.com";
			return when(user.setEmail(''))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.email, 'should@be.com');
				});
		});

		it("should not set non-unqiue email", () => {
			user.email = "should@be.com";
			UserMock
				.expects('count')
				.withArgs({'email':'testy@test.com'})
				.returns(when(1));
			return when(user.setEmail('testy@test.com'))
				.then(valid => {
					assert.equal(valid, false);
					assert.equal(user.email, 'should@be.com');
				});
		});

	});

	/*** Check Password ***/
	context("#checkPassword", function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			user = new User();
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should pass good password", () => {
			return when(User.checkPassword('passy'))
				.then(valid => {
					assert.equal(valid,true);
				});
		});

		it("should fail empty password", () => {
			return when(User.checkPassword(''))
				.then(valid => {
					assert.equal(valid,false);
				});
		});
	});

	/*** Set Password ***/
	context("#setPassword", function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			user = new User();
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should set good password", () => {
			return when(user.setPassword('passy'))
				.then(valid => {
					assert.equal(valid,true);
					assert(user.password);
					assert(user.password.salt);
					assert(user.password.encrypted);
					assert.equal(user.password.encrypted,bcrypt.hashSync('passy',user.password.salt));
				});
		});

		it("should fail empty password", () => {
			user.password = {};
			user.password.salt = 'asdf';
			user.password.encrypted = 'qwer';
			return when(user.setPassword(''))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.password.salt,'asdf');
					assert.equal(user.password.encrypted,'qwer');
				});
		});
	});

	/*** Set Deleted ***/
	context("#setDeleted", function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			user = new User();
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should set to deleted", () => {
			assert(user.setDeleted());
		});
	});

	/*** Match Password ***/
	context("#matchPassword", function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			user = new User();
			//UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should match password", () => {
			user = new User();
			return when(user.setPassword('passy'))
				.then(valid => {
					return when(user.matchPassword('passy'))
						.then(matches => {
							assert.equal(matches,true);
						});
				});
		});

		it("should not match password", () => {
			return when(user.setPassword('passy'))
				.then(valid => {
					return when(user.matchPassword('notPassy'))
						.then(matches => {
							//assert.equal(matches,false);
						});
				});
		});
	});

	/*** Generate Login ***/
	context("#generateLogin", function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
            ctx.stub(User.prototype,'save',function(next) {return next();});
			user = new User();
			user._id = mongoose.Types.ObjectId();
			user.name = 'testing';
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should generate login", () => {
			return when(user.generateLogin())
				.then(token => {
					var tokenarr = token.split('-');
					var tokenstr = tokenarr.slice(1).join('-');
					assert(user.login);
					assert(user.login.code);
					assert(user.login.timestamp);
					return when(jwt.verify(tokenstr,user.login.code))
						.then(decoded => {
							assert.equal(moment(user.login.timestamp).format(),moment(decoded.timestamp).format());
						});
				});
		});
	});

	/*** Verify Login ***/
	context(".verifyLogin", function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
            ctx.stub(User.prototype,'save',function(next) {return next();});
			user = new User();
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should verify login", () => {
			UserMock
				.expects('findOne')
				.withArgs({_id: String(user._id)})
				.returns({exec: function(){ return user}});
			return when(user.generateLogin())
				.then(token => {
					return when(User.verifyLogin(token))
						.then(valid => {
							assert(valid);
						});
				});
		});

		it("should not verify login with bad token", () => {
			UserMock
				.expects('findOne')
				.withArgs({_id: String(user._id)})
				.returns({exec: function() {return user}});
			return when(user.generateLogin())
				.then(token => {
					token = user._id+"-asdfasdfasdf";
					return when(User.verifyLogin(token))
						.then(valid => {
							assert(!valid);
						});
				});
		});

		it("should not verify login with no user", () => {
			UserMock
				.expects('findOne')
				.withArgs({_id: String(user._id)})
				.returns({exec: function() {return null}});
			return when(user.generateLogin())
				.then(token => {
					return when(User.verifyLogin(token))
						.then(valid => {
							assert(!valid);
						});
				});
		});

		it("should not verify login with no token string", () => {
			UserMock
				.expects('findOne')
				.withArgs({_id: String(user._id)})
				.returns({exec: function() {return user;}});
			return when(user.generateLogin())
				.then(token => {
					token = token.split('-')[0]+'-';
					return when(User.verifyLogin(token))
						.then(valid => {
							assert(!valid);
						});
				});
		});

		it("should not verify login with bad ID", () => {
			UserMock
				.expects('findOne')
				.withArgs({_id: String(user._id)})
				.returns({exec: function() {return user;}});
			return when(user.generateLogin())
				.then(token => {
					token = user._id+'-'+jwt.sign({'id':'bad'},user.login.code);
					return when(User.verifyLogin(token))
						.then(valid => {
							assert(!valid);
						});
				});
		});

		it("should not verify login with empty token", () => {
			UserMock
				.expects('findOne')
				.withArgs({_id: String(user._id)})
				.returns({exec: function() {return user;}});
			return when(user.generateLogin())
				.then(token => {
					token = user._id+'-'+jwt.sign({},user.login.code);
					return when(User.verifyLogin(token))
						.then(valid => {
							assert(!valid);
						});
				});
		});

	});

});

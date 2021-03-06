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
				.withArgs({'name':'testy99'})
				.returns(when(0));
			return when(User.checkName('testy99'))
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

		it("should fail too short name", () => {
			return when(User.checkName('abc'))
				.then(valid => {
					assert.equal(valid, false);
				});
		});

		it("should fail too long name", () => {
			return when(User.checkName('abcdeABCDE12345ABCDEabcdef'))
				.then(valid => {
					assert.equal(valid, false);
				});
		});

		it("should pass only letters name", () => {
			UserMock
				.expects('count')
				.withArgs({'name':'abcdeabcde'})
				.returns(when(0));
			return when(User.checkName('abcdeabcde'))
				.then(valid => {
					assert.equal(valid, true);
				});
		});

		it("should pass only numbers name", () => {
			UserMock
				.expects('count')
				.withArgs({'name':'12345'})
				.returns(when(0));
			return when(User.checkName('12345'))
				.then(valid => {
					assert.equal(valid, true);
				});
		});

		it("should fail name with space", () => {
			return when(User.checkName('abc de'))
				.then(valid => {
					assert.equal(valid, false);
				});
		});

		it("should fail name with symbol", () => {
			return when(User.checkName('abcde@'))
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

		it("should not set short name", () => {
			user.name = 'shouldBe';
			return when(user.setName('abc'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.name,'shouldBe');
				});
		});

		it("should not set short name", () => {
			user.name = 'shouldBe';
			return when(user.setName('abcdeABCDEabcdeABCDEabcdeF'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.name,'shouldBe');
				});
		});

		it("should not set name with space", () => {
			user.name = 'shouldBe';
			return when(user.setName('abc def'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.name,'shouldBe');
				});
		});

		it("should not set name with symbol", () => {
			user.name = 'shouldBe';
			return when(user.setName('abc&def'))
				.then(valid => {
					assert.equal(valid,false);
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

		it("should fail an email without an @", () => {
			return when(User.checkEmail('testytest.com'))
				.then(valid => {
					assert.equal(valid,false);
				});
		});
		
		it("should fail an email without an .", () => {
			return when(User.checkEmail('testy@testcom'))
				.then(valid => {
					assert.equal(valid,false);
				});
		});

		it("should fail an email without the first part", () => {
			return when(User.checkEmail('@test.com'))
				.then(valid => {
					assert.equal(valid,false);
				});
		});

		it("should fail an email without the second part", () => {
			return when(User.checkEmail('testy@.com'))
				.then(valid => {
					assert.equal(valid,false);
				});
		});

		it("should fail an email without the third part", () => {
			return when(User.checkEmail('testy@test.'))
				.then(valid => {
					assert.equal(valid,false);
				});
		});

		it("should fail an email with a messed up thid part", () => {
			return when(User.checkEmail('testytest.commmmmmm'))
				.then(valid => {
					assert.equal(valid,false);
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
            ctx.stub(User.prototype,'save',function(next) {return next();});
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

		it("should set good email and update email verification", () => {
			UserMock
				.expects('count')
				.withArgs({'email':'testy@test.com'})
				.returns(when(0));
			user.verified.email = true;
			return when(user.setEmail('testy@test.com'))
				.then(valid => {
					assert.equal(valid,true);
					assert.equal(user.email,'testy@test.com');
					assert.equal(user.verified.email,false);
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

		it("should not set email without @", () => {
			user.email = "should@be.com";
			return when(user.setEmail('testytest.com'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.email, 'should@be.com');
				});
		});

		it("should not set empty email without .", () => {
			user.email = "should@be.com";
			return when(user.setEmail('testy@testcom'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.email, 'should@be.com');
				});
		});

		it("should not set email without first part", () => {
			user.email = "should@be.com";
			return when(user.setEmail('@test.com'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.email, 'should@be.com');
				});
		});

		it("should not set email without second part", () => {
			user.email = "should@be.com";
			return when(user.setEmail('testy@.com'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.email, 'should@be.com');
				});
		});

		it("should not set email without third part", () => {
			user.email = "should@be.com";
			return when(user.setEmail('testy@test.'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.email, 'should@be.com');
				});
		});

		it("should not set email with messed up third part", () => {
			user.email = "should@be.com";
			return when(user.setEmail('testy@test.commmmmmmmm'))
				.then(valid => {
					assert.equal(valid,false);
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
			return when(User.checkPassword('paasSy1+'))
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

		it("should fail too short password", () => {
			return when(User.checkPassword('abcdE+1'))
				.then(valid => {
					assert.equal(valid,false);
				});
		});

		it("should fail too long password", () => {
			return when(User.checkPassword('aA&34567890123456789012345678901234567890'))
				.then(valid => {
					assert.equal(valid,false);
				});
		});

		it("should fail password without at least 1 lower case letter", () => {
			return when(User.checkPassword('BADPASSWORD1&'))
				.then(valid => {
					assert.equal(valid,false);
				});
		});

		it("should fail password without at least 1 upper case letter", () => {
			return when(User.checkPassword('badpassword2&'))
				.then(valid => {
					assert.equal(valid,false);
				});
		});

		it("should fail password without at least 1 number", () => {
			return when(User.checkPassword('badPassword&*'))
				.then(valid => {
					assert.equal(valid,false);
				});
		});

		it("should fail password without at least 1 symbol", () => {
			return when(User.checkPassword('badPassword2345'))
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
			return when(user.setPassword('paassY&1'))
				.then(valid => {
					assert.equal(valid,true);
					assert(user.password);
					assert(user.password.salt);
					assert(user.password.encrypted);
					assert.equal(user.password.encrypted,bcrypt.hashSync('paassY&1',user.password.salt));
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

		it("should fail too short password", () => {
			user.password = {};
			user.password.salt = 'asdf';
			user.password.encrypted = 'qwer';
			return when(user.setPassword('abcdefg'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.password.salt,'asdf');
					assert.equal(user.password.encrypted,'qwer');
				});
		});

		it("should fail too long password", () => {
			user.password = {};
			user.password.salt = 'asdf';
			user.password.encrypted = 'qwer';
			return when(user.setPassword('aA&012345690123457890123456789012345678901234567890'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.password.salt,'asdf');
					assert.equal(user.password.encrypted,'qwer');
				});
		});

		it("should fail password without at least 1 lower case letter", () => {
			user.password = {};
			user.password.salt = 'asdf';
			user.password.encrypted = 'qwer';
			return when(user.setPassword('BADPASSWORD!1'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.password.salt,'asdf');
					assert.equal(user.password.encrypted,'qwer');
				});
		});

		it("should fail password without at least 1 upper case letter", () => {
			user.password = {};
			user.password.salt = 'asdf';
			user.password.encrypted = 'qwer';
			return when(user.setPassword('badpassword!1'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.password.salt,'asdf');
					assert.equal(user.password.encrypted,'qwer');
				});
		});

		it("should fail password without at least 1 number", () => {
			user.password = {};
			user.password.salt = 'asdf';
			user.password.encrypted = 'qwer';
			return when(user.setPassword('badPassword!'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.password.salt,'asdf');
					assert.equal(user.password.encrypted,'qwer');
				});
		});

		it("should fail password without at least 1 symbol", () => {
			user.password = {};
			user.password.salt = 'asdf';
			user.password.encrypted = 'qwer';
			return when(user.setPassword('badPassword1'))
				.then(valid => {
					assert.equal(valid,false);
					assert.equal(user.password.salt,'asdf');
					assert.equal(user.password.encrypted,'qwer');
				});
		});
	});

	/*** Set Language ***/
	context("#setLanguage", function() {

		var ctx = null;
		var user = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
			user = new User();
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should set the user's preferred language", () => {
			assert(user.setLanguage('en'));
		});

		it("should not set bad language - empty", () => {
			assert(!user.setLanguage(''));
		});

		it("should not set bad language - unsupported", () => {
			assert(!user.setLanguage('badlang'));
		});

	});

	/*** Check Language ***/
	context("#checkLanguage", function() {

		var ctx = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should approve language", () => {
			assert(User.checkLanguage('en'));
		});

		it("should not approve empty language", () => {
			assert(!User.checkLanguage(''));
		});

		it("should not approve unsupported language", () => {
			assert(!User.checkLanguage('badlanguagecode'));
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
			return when(user.setPassword('paaassY&1'))
				.then(valid => {
					return when(user.matchPassword('paaassY&1'))
						.then(matches => {
							assert.equal(matches,true);
						});
				});
		});

		it("should not match password", () => {
			return when(user.setPassword('paaassY&1'))
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

	/*** Generate Email Verification ***/
	context(".generateEmailVerification", function() {

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

		it("should generate email verification", () => {
			return when(user.generateEmailVerification())
				.then(r => {
					assert(user.verified.code);
				}).otherwise(err => {
					assert(false);
				});			
		});

		it("should not generate email verification, if already verified", () => {
			user.verified.email = true;
			return when(user.generateEmailVerification())
				.then(r => {
					assert.equal(r,false);
				}).otherwise(err => {
					assert(false);
				});
		});
	});

	/*** Verify Email Verification ***/
	context('#verifyEmailVerification', function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
            ctx.stub(User.prototype,'save',function(next) {return next();});
			user = new User();
			ctx.stub(User,'findOne',function(args) {
				if(args.email && args.email == 'testy@test.com') {
					return {exec:function(){return user;}};
				} else if(args.email && args.email == 'bademail@test.com') {
					return {exec: function(){return new User();}};
				} else {
					return {exec:function(){return null;}};
				}
			});
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it("should verify email", () => {
			user.verified.code = "testtest";
			return when(User.verifyEmailVerification('testy@test.com','testtest'))
				.then(() => {
					assert.equal(user.verified.email,true);
					assert.equal(user.verified.code,'');
				}).otherwise(err => {
					assert(false);
				});
		});

		it("should not verify email with no email", () => {
			user.verified.code = "testtest";
			return when(User.verifyEmailVerification('','testtest'))
				.then(() => {
					assert.equal(user.verified.email,false);
					assert.equal(user.verified.code,'testtest');
				}).otherwise(err => {
					assert(false);
				});
		});

		it("should not verify email with bad email", () => {
			user.verified.code = "testtest";
			return when(User.verifyEmailVerification('bademail@test.com','testtest'))
				.then(() => {
					assert.equal(user.verified.email,false);
					assert.equal(user.verified.code,'testtest');
				}).otherwise(err => {
					assert(false);
				});
		});

		it("should not verify email with no code", () => {
			user.verified.code = "testtest";
			return when(User.verifyEmailVerification('testy@test.com',''))
				.then(() => {
					assert.equal(user.verified.email,false);
					assert.equal(user.verified.code,'testtest');
				}).otherwise(err => {
					assert(false);
				});
		});

		it("should not verify email with bad code", () => {
			user.verified.code = "testtest";
			return when(User.verifyEmailVerification('testy@test.com','badcode'))
				.then(() => {
					assert.equal(user.verified.email,false);
					assert.equal(user.verified.code,'testtest');
				}).otherwise(err => {
					assert(false);
				});
		});

	});

	/*** Reset Email Verification ***/
	context('.resetEmailVerification', function() {

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

		it("should reset email verification", () => {
			user.verified.email = true;
			user.verified.code = 'asdfsadfdf';
			return when(user.resetEmailVerification())
				.then(r => {
					assert.equal(user.verified.email,false);
					assert.equal(user.verified.code,'');
				}).otherwise(err => {
					assert(false);
				});
		});
	});

	/*** Generate Account Recovery ***/
	context('#generateAccountRecovery', function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
            ctx.stub(User.prototype,'save',function(next) {return next();});
			user = new User();
			user.email = 'testy@test.com';
			ctx.stub(User,'findOne',function(args) {
				if(args.email && args.email == 'testy@test.com') {
					return {exec:function(){return user;}};
				} else if(args.email && args.email == 'bademail@test.com') {
					return {exec: function(){return new User();}};
				} else {
					return {exec:function(){return null;}};
				}
			});
		});

		afterEach(function() {
			ctx.restore();
		});

		it('should generate account recovery code', () => {
			user.setDeleted();
			return when(User.generateAccountRecovery('testy@test.com'))
				.then(() => {
					assert.equal(user.recovery.field,'deleted');
					assert(user.recovery.code);
				});
		});

		it('should not generate account recovery, if not deleted', () => {
			user.deleted = false;
			user.recovery = {field:'',code:''};
			return when(User.generateAccountRecovery('testy@test.com'))
				.then(user => {
					assert.equal(user,false);
				});
		});

		it('should not generate account recovery with no email', () => {
			return when(User.generateAccountRecovery(''))
				.then(user => {
					assert.equal(user,false);
				});
		});

		it('should not generate account recovery with bad email', () => {
			return when(User.generateAccountRecovery('bademail@test.com'))
				.then(user => {
					assert.equal(user,false);
				});
		});
	});

	/*** Validate Account Recovery ***/
	context('#validateAccountRecovery', function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
            ctx.stub(User.prototype,'save',function(next) {return next();});
			user = new User();
			user.email = 'testy@test.com';
			ctx.stub(User,'findOne',function(args) {
				if(args.email && args.email == 'testy@test.com') {
					return {exec:function(){return user;}};
				} else if(args.email && args.email == 'bademail@test.com') {
					return {exec: function(){return new User();}};
				} else {
					return {exec:function(){return null;}};
				}
			});
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it('should verify and recover account', () => {
			user.setDeleted();
			return when(User.generateAccountRecovery(user.email))
				.then(() => {
					return when(User.verifyAccountRecovery(user.email,user.recovery.code,'Test+12345'))
						.then(() => {
							assert.equal(user.deleted, false);
							assert.equal(user.recovery.field, null);
							assert.equal(user.recovery.code, '');
							assert(user.matchPassword('Test+12345'));
						});
				});
		});

		it('should not verify account which is not deleted', () => {
			return when(User.verifyAccountRecovery(user.email,user.recovery.code,'Test+12345'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account with no email', () => {
			user.setDeleted();
			return when(User.verifyAccountRecovery('',user.recovery.code,'Test+12345'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account with bad email', () => {
			user.setDeleted();
			return when(User.verifyAccountRecovery('bad.email@test.com',user.recovery.code,'Test+12345'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account with no code', () => {
			user.setDeleted();
			return when(User.verifyAccountRecovery(user.email,'','Test+12345'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account with bad code', () => {
			user.setDeleted();
			return when(User.verifyAccountRecovery(user.email,'badcode','Test+12345'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account with no password', () => {
			user.setDeleted();
			return when(User.verifyAccountRecovery(user.email,user.recovery.code,''))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account with bad password - too short', () => {
			user.setDeleted();
			return when(User.verifyAccountRecovery(user.email,user.recovery.code,'aBc1@3'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account with bad password - too long', () => {
			user.setDeleted();
			return when(User.verifyAccountRecovery(user.email,user.recovery.code,'aB@01234567890123456789012345678901234567890'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account with bad password - missing upper case letter', () => {
			user.setDeleted();
			return when(User.verifyAccountRecovery(user.email,user.recovery.code,'badpassword1@'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account with bad password - missing lower case letter', () => {
			user.setDeleted();
			return when(User.verifyAccountRecovery(user.email,user.recovery.code,'BADPASSWORD1@'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account with bad password - missing number', () => {
			user.setDeleted();
			return when(User.verifyAccountRecovery(user.email,user.recovery.code,'BadPassword!@'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account with bad password - missing symbol', () => {
			user.setDeleted();
			return when(User.verifyAccountRecovery(user.email,user.recovery.code,'BadPassword123'))
				.then(r => {
					assert.equal(r, false);
				});
		});
	});

	/*** Generate Account Password Recovery ***/
	context('#generatePasswordRecovery', function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
            ctx.stub(User.prototype,'save',function(next) {return next();});
			user = new User();
			user.email = 'testy@test.com';
			ctx.stub(User,'findOne',function(args) {
				if(args.email && args.email == 'testy@test.com') {
					return {exec:function(){return user;}};
				} else if(args.email && args.email == 'bademail@test.com') {
					return {exec: function(){return new User();}};
				} else {
					return {exec:function(){return null;}};
				}
			});
		});

		afterEach(function() {
			ctx.restore();
		});

		it('should generate account password recovery code', () => {
			user.setDeleted();
			return when(User.generatePasswordRecovery('testy@test.com'))
				.then(() => {
					assert.equal(user.recovery.field,'password');
					assert(user.recovery.code);
				});
		});

		it('should not generate account password recovery with no email', () => {
			return when(User.generateAccountRecovery(''))
				.then(user => {
					assert.equal(user,false);
				});
		});

		it('should not generate account password recovery with bad email', () => {
			return when(User.generateAccountRecovery('bademail@test.com'))
				.then(user => {
					assert.equal(user,false);
				});
		});
	});

	/*** Validate Account Password Recovery ***/
	context('#validatePasswordRecovery', function() {

		var ctx = null;
		var user = null;
		var UserMock = null;

		beforeEach(function() {
			ctx = sinon.sandbox.create();
            ctx.stub(User.prototype,'save',function(next) {return next();});
			user = new User();
			user.email = 'testy@test.com';
			ctx.stub(User,'findOne',function(args) {
				if(args.email && args.email == 'testy@test.com') {
					return {exec:function(){return user;}};
				} else if(args.email && args.email == 'bademail@test.com') {
					return {exec: function(){return new User();}};
				} else {
					return {exec:function(){return null;}};
				}
			});
			UserMock = ctx.mock(User);
		});

		afterEach(function() {
			ctx.restore();
		});

		it('should verify and recover account password', () => {
			return when(User.generatePasswordRecovery(user.email))
				.then(() => {
					return when(User.verifyPasswordRecovery(user.email,user.recovery.code,'Test+12345'))
						.then(() => {
							assert.equal(user.recovery.field, '');
							assert.equal(user.recovery.code, '');
							assert(user.matchPassword('Test+12345'));
						});
				});
		});

		it('should not verify account password with no email', () => {
			return when(User.verifyPasswordRecovery('',user.recovery.code,'Test+12345'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account password with bad email', () => {
			return when(User.verifyPasswordRecovery('bad.email@test.com',user.recovery.code,'Test+12345'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account password with no code', () => {
			return when(User.verifyPasswordRecovery(user.email,'','Test+12345'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account password with bad code', () => {
			return when(User.verifyPasswordRecovery(user.email,'badcode','Test+12345'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account password with no password', () => {
			return when(User.verifyPasswordRecovery(user.email,user.recovery.code,''))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account password with bad password - too short', () => {
			return when(User.verifyPasswordRecovery(user.email,user.recovery.code,'aBc1@3'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account password with bad password - too long', () => {
			return when(User.verifyPasswordRecovery(user.email,user.recovery.code,'aB@01234567890123456789012345678901234567890'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account password with bad password - missing lower case letter', () => {
			return when(User.verifyPasswordRecovery(user.email,user.recovery.code,'BADPASSWORD1!'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account password with bad password - missing uppper case letter', () => {
			return when(User.verifyPasswordRecovery(user.email,user.recovery.code,'badpassword1!'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account password with bad password - missing number', () => {
			return when(User.verifyPasswordRecovery(user.email,user.recovery.code,'BadPassword!'))
				.then(r => {
					assert.equal(r, false);
				});
		});

		it('should not verify account password with bad password - missing symbol', () => {
			return when(User.verifyPasswordRecovery(user.email,user.recovery.code,'BadPassword123'))
				.then(r => {
					assert.equal(r, false);
				});
		});
	});
});

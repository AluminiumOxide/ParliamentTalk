var assert = require('assert');
var hippie = require('hippie-swagger');
var when = require('when');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(app, swagger) {

	describe('Authentication', function() {
	
		before(function() {
			var user = new User();
			return when(user.setName("testy"))
				.then(success => {
					return when(user.setEmail("testy@test.com"))
						.then(success => {
							return when(user.setPassword("abc123+XYZ"))
								.then(success => {
									return when(user.save());
								});
						});
				});
		});

		after(function() {
            return when(User.find({}).remove().exec());
		});

		describe('Sign In', function() {
			it('should sign in', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy",
						"password":"abc123+XYZ"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
						} else {
							if(body && body.token) {
								assert(true);
							} else {
								assert(false);
							}
						}
						done();
					});
			});
			it('should not sign in with bad username', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"badusername",
						"password":"abc123+XYZ"
					})
					.expectStatus(400)
					.end(function(err, res, body) {
						if (err) {
							if(body && body.error == 'Invalid user name or password') {
								assert(true);
							}
						} else {
							assert(false);
						}
						done();
					});
			});
			it('should not sign in with bad password', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy",
						"password":"badpassword"
					})
					.expectStatus(400)
					.end(function(err, res, body) {
						if (err) {
							if(body && body.error == 'Invalid user name or password') {
								assert(true);
							}
						} else {
							assert(false);
						}
						done();
					});
			});
			it('should not sign in without name', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/signIn')
						.send({
							"password":"abc123+XYZ"
						})
						.expectStatus(400)
						.end(function(err, res, body) {
							done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
				assert(false);
				return done();
			});
			it('should not sign in without name', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/signIn')
						.send({
							"name":"testy"
						})
						.expectStatus(400)
						.end(function(err, res, body) {
							done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
				assert(false);
				return done();
			});
		});

		describe('Sign Out', function() {
			it('should sign out after sign in', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy",
						"password":"abc123+XYZ"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
						} else {
							if(body && body.token) {
								hippie(app, swagger)
									.header('x-access-token',body.token)
									.post('/api/signOut')
									.expectStatus(200)
									.end(function(err, res, body) {
										if(err) {
											assert(false);
										} else {
											assert(true);
										}
									});
							} else {
								assert(false);
							}
						}
						return done();
					});
			});
			it('should not sign out without token', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy",
						"password":"abc123+XYZ"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
						} else {
							if(body && body.token) {
								try {
								hippie(app, swagger)
									.post('/api/signOut')
									.expectStatus(200)
									.end(function(err, res, body) {
										if(err) {
											assert(true);
										} else {
											assert(false);
										}
									});
								} catch(err) {
									assert(true);
									return done();
								}
							} else {
								assert(false);
							}
						}
						return done();
					});
			});
			it('should not sign out with a bad token', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy",
						"password":"abc123+XYZ"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
						} else {
							if(body && body.token) {
								hippie(app, swagger)
									.header('x-access-token','qwerqwer-qwerqwerer')
									.post('/api/signOut')
									.expectStatus(400)
									.end(function(err, res, body) {
										if(err) {
											assert(true);
											return done();
										} else {
											assert(false);
											return done();
										}
									});
							} else {
								assert(false);
							}
						}
					});
			});
			it('should not sign out if already signed out', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy",
						"password":"abc123+XYZ"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
						} else {
							if(body && body.token) {
								hippie(app, swagger)
									.header('x-access-token',body.token)
									.post('/api/signOut')
									.expectStatus(200)
									.end(function(err, res, bodytwo) {
										if(err) {
											assert(false);
										} else {
											assert(true);
											hippie(app, swagger)
											.header('x-access-token',body.token)
											.post('/api/signOut')
											.expectStatus(400)
											.end(function(err, res, body) {
												if(err) {	
													assert(true);
													return done();
												} else {
													assert(false);
													return done();
												}
											});
										}
									});
							} else {
								assert(false);

							}
						}
					});
			});
		});
	});
};

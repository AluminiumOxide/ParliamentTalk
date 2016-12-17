var assert = require('assert');
var hippie = require('hippie-swagger');
var when = require('when');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(app, swagger) {

	describe('Authentication', function() {
	
		before(function() {
            return when(User.find({}).remove().exec());
		});

		after(function() {
            return when(User.find({}).remove().exec());
		});

		describe('Sign Up', function() {
			it('should sign up', function(done) {
				hippie(app, swagger)
					.post('/api/signUp')
					.send({
						"email":"testy@test.com",
						"name":"testy",
						"password":"abc123"
					})
					.expectStatus(201)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
						} else {
							assert(true);
						}
						done();
					});
			});
			it('should not sign up without email', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/signUp')
						.send({
							"name":"testy",
							"password":"abc123"
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
			it('should not sign up without name', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/signUp')
						.send({
							"email":"testy@test.com",
							"password":"abc123"
						})
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
			it('should not sign up without password', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/signUp')
						.send({
							"email":"testy@test.com",
							"name":"testy",
						})
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
			it('should not sign up with duplicate email', function(done) {
				hippie(app, swagger)
					.post('/api/signUp')
					.send({
						"email":"testy@test.com",
						"name":"testy123",
						"password":"abc123"
					})
					.end(function(err, res, body) {
						if (err) {
							assert(true);
						} else {
							assert(false);
						}
						done();
					});
			});
			it('should not sign up with duplicate user name', function(done) {
				hippie(app, swagger)
					.post('/api/signUp')
					.send({
						"email":"testy123@test.com",
						"name":"testy",
						"password":"abc123"
					})
					.end(function(err, res, body) {
						if (err) {
							assert(true);
						} else {
							assert(false);
						}
      						done();
					});
			});
		});

		describe('Sign In', function() {
			it('should sign in', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy",
						"password":"abc123"
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
						"password":"abc123"
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
							"password":"abc123"
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
						"password":"abc123"
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
						"password":"abc123"
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
						"password":"abc123"
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
						"password":"abc123"
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

var assert = require('assert');
var hippie = require('hippie-swagger');
var when = require('when');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(app, swagger) {

	describe('Account', function() {

		var user = new User();

		before(function() {
			return when(user.setName("testy"))
				.then(success => {
					return when(user.setEmail("testy@test.com"))
						.then(success => {
							return when(user.setPassword("abc123"))
								.then(success => {
									return when(user.save());
								});
						});
				});
		});

		after(function() {
			return when(User.find({}).remove().exec());
		});

		describe('View Account', function() {
			it('should view account after sign in', function(done) {
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
									.get('/api/account')
									.expectStatus(200)
									.end(function(err, res, body) {
										if(err) {
											assert(false);
										} else {
											assert.equal(body.name,'testy');
										}
									});
							} else {
								assert(false);
							}
						}
						return done();
					});
			});
            it('should not view account without token', function(done) {
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
                                    .get('/api/account')
                                    .expectStatus(400)
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
            it('should not view account with a bad token', function(done) {
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
                                    .get('/api/account')
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
			it('should not view account if already signed out', function(done) {
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
                                            .get('/api/account')
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

		describe('Update Account', function() {
			it('should update account after sign in', function(done) {
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
							return done();
						} else {
							if(body && body.token) {
								hippie(app, swagger)
									.header('x-access-token',body.token)
									.post('/api/account')
									.send({
										"name":"testy1",
										"email":"testy1@test.com",
										"password":"qwerqwer"
									})
									.expectStatus(200)
									.end(function(err, res, body) {
										if(err) {
											assert(false);
											return done();
										} else {
											assert(true);
											return done();
										}
									});
							} else {
								assert(false);
								return done();
							}
						}
					});
			});
			it('should not update account with bad token', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
							return done();
						} else {
							if(body && body.token) {
								hippie(app, swagger)
									.header('x-access-token','badtoken')
									.post('/api/account')
									.send({
										"name":"testy1",
										"email":"testy1@test.com",
										"password":"qwerqwer"
									})
									.expectStatus(400)
									.end(function(err, res, body) {
											assert(true);
											return done();
									});
							} else {
								assert(false);
								return done();
							}
						}
					});
			});
			it('should not update account with out sign in', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"name":"testy1",
							"email":"testy1@test.com",
							"password":"qwerqwer"
						})
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
				} catch(err) {
					assert(true);
					done();
				};
			});
// TODO: more tests here
		});
	});
};

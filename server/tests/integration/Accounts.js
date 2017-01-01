var assert = require('assert');
var hippie = require('hippie-swagger');
var when = require('when');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(app, swagger) {

	describe('Account', function() {

		var user = new User();

		before(function() {
			return when(User.find({}).remove().exec());
		});

		after(function() {
			return when(User.find({}).remove().exec());
		});

		describe('Create Account', function() {
			it('should create account', function(done) {
				hippie(app, swagger)
					.post('/api/account')
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
			it('should not create account without email', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
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
			it('should not create account without name', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
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
			it('should not create account without password', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
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
			it('should not create account with duplicate email', function(done) {
				hippie(app, swagger)
					.post('/api/account')
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
			it('should not create account with duplicate user name', function(done) {
				hippie(app, swagger)
					.post('/api/account')
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
									.patch('/api/account')
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
									.patch('/api/account')
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
						.patch('/api/account')
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

		describe('Delete Account', function() {
			it('should not delete account with bad token', function(done) {
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
									.url('/api/account')
									.method('DELETE')
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
			it('should not delete account with out sign in', function(done) {
				try {
					hippie(app, swagger)
						.url('/api/account')
						.method('DELETE')
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
			it('should delete account after sign in', function(done) {
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
									.header('x-access-token',body.token)
									.url('/api/account')
									.method('DELETE')
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
			it('should not sign in after account is deleted', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer"
					})
					.expectStatus(400)
					.end(function(err, res, body) {
						if (err) {
							assert(true);
							return done();
						} else {
							assert(false);
							return done();
						}
					});
			});
		});
	});
};

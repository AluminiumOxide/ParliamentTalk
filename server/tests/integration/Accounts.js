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

		describe('Check Name', function() {
			it('should approve a potential name', function(done) {
				hippie(app, swagger)
					.post('/api/account/check/name')
					.send("testy123")
					.expectStatus(200)
					.end(function(err, res, body) {
						if(err) {
							assert(false);
							return done();
						} else {
							assert(res.body);
							return done();
						}
					});
			});
			it('should not approve a duplicate name', function(done) {
				hippie(app, swagger)
					.post('/api/account/check/name')
					.send('testy1')
					.expectStatus(200)
					.end(function(err, res, body) {
						if(err) {
							assert(false);
							return done();
						} else {
							assert.equal(body,false);
							return done();
						}
				});
			});
			it('should not approve an empty name', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/name')
						.send("")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!res.body);
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
		});
		describe('Check Email', function() {
			it('should approve a potential email', function(done) {
				hippie(app, swagger)
					.post('/api/account/check/email')
					.send("testy123@testy.com")
					.expectStatus(200)
					.end(function(err, res, body) {
						if(err) {
							assert(false);
							return done();
						} else {
							assert(res.body);
							return done();
						}
					});
			});
			it('should not approve a duplicate email', function(done) {
				hippie(app, swagger)
					.post('/api/account/check/email')
					.send('testy1@test.com')
					.expectStatus(200)
					.end(function(err, res, body) {
						if(err) {
							assert(false);
							return done();
						} else {
							assert.equal(body,false);
							return done();
						}
				});
			});
			it('should not approve an empty email', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/email')
						.send("")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!res.body);
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
		});
		describe('Check Password', function() {
			it('should approve a potential password', function(done) {
				hippie(app, swagger)
					.post('/api/account/check/password')
					.send("testy123")
					.expectStatus(200)
					.end(function(err, res, body) {
						if(err) {
							assert(false);
							return done();
						} else {
							assert(res.body);
							return done();
						}
					});
			});
			it('should not approve an empty password', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/password')
						.send("")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!res.body);
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
		});
		describe('Verify Email', function() {

			it('should not verify email first request, without auth token', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						hippie(app, swagger)
							.header('x-access-token','')
							.post('/api/account/verify/email')
							.send(null)
							.expectStatus(400)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								}
								assert.equal(res.body,'false');
								return done();
							});
					});
			});
			it('should not verify email first request, with bad token', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						hippie(app, swagger)
							.header('x-access-token','badtoken')
							.post('/api/account/verify/email')
							.send(null)
							.expectStatus(400)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								}
								assert.equal(res.body,'false');
								return done();
							});
					});
			});
			it('should not verify email first request, without login', function(done) {
				hippie(app, swagger)
					.post('/api/account/verify/email')
					.send(null)
					.expectStatus(400)
					.end(function(err, res, body) {
						if(err) {
							assert(false);
							return done();
						}
						assert.equal(res.body,'false');
						return done();
					});
			});
			it('should verify email', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						hippie(app, swagger)
							.header('x-access-token',body.token)
							.post('/api/account/verify/email')
							.send(null)
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								}
								assert(res.body,'true');
								return when(User.findOne({'name':'testy1'}).exec())
									.then(newuser => {
										hippie(app, swagger)
											.post('/api/account/verify/email')
											.send({
												email:newuser.email,
												verificationCode:newuser.verified.code
											})
											.expectStatus(200)
											.end(function(err, res, body) {
												if(err) {
													assert(false);
													return done();
												}
												assert.equal(res.body,'true');
												return done();
											});
									});
							});
					});
			});
			it('should not verify email first request, if already verified', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						hippie(app, swagger)
							.header('x-access-token',body.token)
							.post('/api/account/verify/email')
							.send(null)
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								}
								assert.equal(res.body,'false');
								return done();
							});
					});
			});
			it('should not verify email second request, if bad email provided', function(done) {
				when(User.findOne({'name':'testy1'}).exec())
					.then(user => {	
						when(user.resetEmailVerification())
							.then(user => {
								hippie(app, swagger)
									.post('/api/signIn')
									.send({
										"name":"testy1",
										"password":"qwerqwer"
									})
									.expectStatus(200)
									.end(function(err, res, body) {
										hippie(app, swagger)
											.header('x-access-token',body.token)
											.post('/api/account/verify/email')
											.send(null)
											.expectStatus(200)
											.end(function(err, res, body) {
												if(err) {
													assert(false);
													return done();
												}
												assert.equal(res.body,'true');
												hippie(app, swagger)
													.post('/api/account/verify/email')
													.send({
														email: 'bad.email@test.com',
														verificationCode: user.verified.code
													})
													.expectStatus(200)
													.end(function(err, res, body) {
														if(err) {
															assert(false);
															return done();
														}
														assert.equal(res.body,'false');
														return done();
													});
											});
									});
							});
					});
			});
			it('should not verify email second request, if no email provided', function(done) {
				when(User.findOne({'name':'testy1'}).exec())
					.then(newuser => {
						hippie(app, swagger)
							.post('/api/account/verify/email')
							.send({
								verificationCode:newuser.verified.code
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								}
								assert.equal(res.body,'false');
								return done();
							});
					});	
			});
			it('should not verify email second request, if no verification code provided', function(done) {
				when(User.findOne({'name':'testy1'}).exec())
					.then(newuser => {
						hippie(app, swagger)
							.post('/api/account/verify/email')
							.send({
								email: newuser.email
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								}
								assert.equal(res.body,'false');
								return done();
							});
					});
			});	
			it('should not verify email second request, if bad verification code provided', function(done) {
				when(User.findOne({'name':'testy1'}).exec())
					.then(newuser => {
						hippie(app, swagger)
							.post('/api/account/verify/email')
							.send({
								email: newuser.email,
								verificationCode:'badverificationcode'
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								}
								assert.equal(res.body,'false');
								return done();
							});
					});	
			});
			it('should not verify email second request, if already verified', function(done) {
				var email = null;
				var code = null;
				when(User.findOne({'name':'testy1'}).exec())
					.then(newuser => {
						email = newuser.email;
						code = newuser.verified.code;
						hippie(app, swagger)
							.post('/api/account/verify/email')
							.send({
								email: email,
								verificationCode: code
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								}
								assert.equal(res.body,'true');
								hippie(app, swagger)
									.post('/api/account/verify/email')
									.send({
										email: email,
										verificationCode: code
									})
									.expectStatus(200)
									.end(function(err, res, body) {
										if(err) {
											assert(false);
											return done();
										}
										assert.equal(res.body,'false');
										return done();
									});
							});
					});	
			});
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
		describe('Recover Deleted Account', () => {
			it('should not generate recovery with no email', () => {
				hippie(app, swagger)
					.post('/api/account/recover/deleted')
					.send({})
					.expectStatus(200)
					.end(function(err, res, body) {
						if(err) {
							assert(false);
							return done();
						} else {
							assert.equal(res.body,'false');
							return done();

						}
					});
			});
			it('should not generate recovery with bad email', function(done) {
				hippie(app, swagger)
					.post('/api/account/recover/deleted')
					.send({
						"email":'bademail@bad.com'
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if(err) {
							assert(false);
							return done();
						} else {
							assert.equal(res.body,'false');
							return done();
			
						}
					});
			});
			it('should recover a deleted account - part 1', function(done) {
				when(User.findOne({'name':'testy1'}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								} else {
									assert.equal(res.body,'true');
									return done();
								}
							});
					});
			});
			it('should not verify recovery with no email', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"code": user.recovery.code,
								"password":"newpass123"
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								} else {
									assert.equal(res.body,'false');
									return done();

								}
							});
					});
			});
			it('should not validate recovery with bad email', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":'bademail@bad.com',
								"code":user.recovery.code,
								"password":"newpass123"
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								} else {
									assert.equal(res.body,'false');
									return done();
					
								}
							});
					});
			});
			it('should not validate recovery with no code', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email,
								"password":"newpass123"
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								} else {
									assert.equal(res.body,'false');
									return done();
		
								}
							});
					});
			});
			it('should not validate recovery with bad code', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email,
								"code":"badcode",
								"password":"newpass123"
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								} else {
									assert.equal(res.body,'false');
									return done();
					
								}
							});
					});
			});
			it('should not validate recovery with no password', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email,
								"code":user.recovery.code
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								} else {
									assert.equal(res.body,'false');
									return done();
					
								}
							});
					});
			});
			it('should not validate recovery with bad password', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":""
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								} else {
									assert.equal(res.body,'false');
									return done();
					
								}
							});
					});
			});
			it('should recover a deleted account - part 2', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app,swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email,
								"password":"newpass123",
								"code":user.recovery.code
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								} else {
									assert(res.body,'true');
									return done();
								}
							});
					});
			});
			it('should not generate recovery for an undeleted account', function(done) {
				when(User.findOne({'name':'testy1'}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								} else {
									assert.equal(res.body,'false');
									return done();

								}
							});
					});
			});
		});
		describe('Recover forgotten username', () => {
			it('should send username via email', function(done) {
				when(User.findOne({'name':'testy1'}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/username')
							.send({
								"email":user.email
							})
							.expectStatus(200)
							.end(function(err, res, body) {
								if(err) {
									assert(false);
									return done();
								} else {
									assert.equal(res.body,'true');
									return done();
								}
							});
					});
			});
			it('should not send email, if no email provided', function(done) {
				hippie(app, swagger)
					.post('/api/account/recover/username')
					.send({})
					.expectStatus(200)
					.end(function(err, res, body) {
						if(err) {
							assert(false);
							return done();
						} else {
							assert.equal(res.body,'false');
							return done();
						}
					});
			});
			it('should not send email, if bad email provided', function(done) {
				hippie(app, swagger)
					.post('/api/account/recover/username')
					.send({
						"email":"bad.email@bad.com"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if(err) {
							assert(false);
							return done();
						} else {
							assert.equal(res.body,'false');
							return done();
						}
					});
			});
		});
	});
};

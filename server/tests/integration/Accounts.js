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
						"password":"abc123.ASDF",
						"language":"en"
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
							"password":"abc123.ASDF",
							"language":"en"
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
							"password":"abc123.ASDF",
							"language":"en"
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
							"language":"en"
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
			it('should not create account without language', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy@test.com",
							"name":"testy",
							"password":"abc123.ASDF"
						})
						.end(function(err, res, body) {
							if(err) {
								assert(true);
								return done();
							}
							assert(false);
							return done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with duplicate email', function(done) {
				hippie(app, swagger)
					.post('/api/account')
					.send({
						"email":"testy@test.com",
						"name":"testy123",
						"password":"abc123.ASDF",
						"language":"en"
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
						"password":"abc123.ASDF",
						"language":"en"
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
			it('should not create account with an empty user name', function(done) {
				hippie(app, swagger)
					.post('/api/account')
					.send({
						"email":"testy123@testy.com",
						"name":"",
						"password":"abc123.ASDF",
						"language":"en"
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
			it('should not create account with a short user name', function(done) {
				hippie(app, swagger)
					.post('/api/account')
					.send({
						"email":"testy123@testy.com",
						"name":"abc",
						"password":"abc123.ASDF",
						"language":"en"
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
			it('should not create account with a long user name', function(done) {
				hippie(app, swagger)
					.post('/api/account')
					.send({
						"email":"testy123@testy.com",
						"name":"abcdeABCDEabcdeABCDEabcdeF",
						"password":"abc123.ASDF",
						"language":"en"
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
			it('should not create account with a name with a space', function(done) {
				hippie(app, swagger)
					.post('/api/account')
					.send({
						"email":"testy123@testy.com",
						"name":"abc def",
						"password":"abc123.ASDF",
						"language":"en"
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
			it('should not create account with a name with a symbol', function(done) {
				hippie(app, swagger)
					.post('/api/account')
					.send({
						"email":"testy123@testy.com",
						"name":"abc@def",
						"password":"abc123.ASDF",
						"language":"en"
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
			it('should not create account with a email without @', function(done) {
				try { 
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123testy.com",
							"name":"abcdef",
							"password":"abc123.ASDF",
							"language":"en"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with a email without .', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123@testycom",
							"name":"abcdef",
							"password":"abc123.ASDF",
							"language":"en"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						return done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with a email without the first part', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"@testy.com",
							"name":"abcdef",
							"password":"abc123.ASDF",
							"language":"en"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with a email without the second part', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123@.com",
							"name":"abcdef",
							"password":"abc123.ASDF",
							"language":"en"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with a email without the third part', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123@testy.",
							"name":"abcdef",
							"password":"abc123.ASDF",
							"language":"en"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with a email with a messed up third part', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123@testy.commmmmmmmmmmm",
							"name":"abcdef",
							"password":"abc123.ASDF",
							"language":"en"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						return done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with a too short password', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123@testy.com",
							"name":"abcdef",
							"password":"a1.A",
							"language":"en"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						return done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with a too long password', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123@testy.com",
							"name":"abcdef",
							"password":"aB@012345678901234567890123456788901234567890",
							"language":"en"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						return done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with a password missing lower case letters', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123@testy.com",
							"name":"abcdef",
							"password":"BADPASSWORD1!",
							"language":"en"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						return done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with a password missing upper case letters', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123@testy.com",
							"name":"abcdef",
							"password":"badpassword1!",
							"language":"en"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						return done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with a password missing numbers', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123@testy.com",
							"name":"abcdef",
							"password":"BadPassword!@#",
							"language":"en"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						return done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with a password missing symbols', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123@testy.com",
							"name":"abcdef",
							"password":"BADPASSWORD123",
							"language":"en"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						return done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with empty language', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123@testy.com",
							"name":"abcdef",
							"password":"abc.123ASDF",
							"language":""
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						return done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
			it('should not create account with bad language', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account')
						.send({
							"email":"testy123@testy.com",
							"name":"abcdef",
							"password":"abc.123ASDF",
							"language":"badlanguage"
						})
						.end(function(err, res, body) {
							if (err) {
								assert(true);
							} else {
								assert(false);
							}
	      						return done();
						});
				} catch(err) {
					assert(true);
					return done();
				};
			});
		});

		describe('View Account', function() {
			it('should view account after sign in', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy",
						"password":"abc123.ASDF"
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
                        "password":"abc123.ASDF"
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
                        "password":"abc123.ASDF"
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
                        "password":"abc123.ASDF"
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
						"password":"abc123.ASDF"
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
										"password":"qwerqwer.3QWER",
										"language":"fr"
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
						"password":"qwerqwer.3QWER"
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
										"password":"qwerqwer.3QWER",
										"language":"fr"
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
							"password":"qwerqwer.3QWER",
							"language":"fr"
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
			it('should not update account with empty username', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
										"name":"",
										"email":"testy1@test.com",
										"password":"qwerqwer.3QWER",
										"language":"fr"
									})
									.expectStatus(500)
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
								return done();
							}
						}
					});
			});
			it('should not update account with short username', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
										"name":"abc",
										"email":"testy1@test.com",
										"password":"qwerqwer.3QWER",
										"language":"fr"
									})
									.expectStatus(500)
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
								return done();
							}
						}
					});
			});
			it('should not update account with long username', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
										"name":"abcdeABCDEabcdeABCDEabcdeF",
										"email":"testy1@test.com",
										"password":"qwerqwer.3QWER",
										"language":"fr"
									})
									.expectStatus(500)
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
								return done();
							}
						}
					});
			});
			it('should not update account with username with a space', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
										"name":"abc def",
										"email":"testy1@test.com",
										"password":"qwerqwer.3QWER",
										"language":"fr"
									})
									.expectStatus(500)
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
								return done();
							}
						}
					});
			});
			it('should not update account with username with a symbol', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
										"name":"abc#def",
										"email":"testy1@test.com",
										"password":"qwerqwer.3QWER",
										"language":"fr"
									})
									.expectStatus(500)
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
								return done();
							}
						}
					});
			});
			it('should not update account with email without @', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
							return done();
						} else {
							if(body && body.token) {
								try {
									hippie(app, swagger)
										.header('x-access-token',body.token)
										.patch('/api/account')
										.send({
											"name":"abcdef",
											"email":"testy1test.com",
											"password":"qwerqwer.3QWER",
											"language":"fr"
										})
										.expectStatus(500)
										.end(function(err, res, body) {
											if(err) {
												assert(true);
												return done();
											} else {
												assert(false);
												return done();
											}
										});
								} catch(e) {
									assert(true);
									return done();
								}
							} else {
								assert(false);
								return done();
							}
						}
					});
			});
			it('should not update account with email without .', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
							return done();
						} else {
							if(body && body.token) {
								try {
									hippie(app, swagger)
										.header('x-access-token',body.token)
										.patch('/api/account')
										.send({
											"name":"abcdef",
											"email":"testy1@testcom",
											"password":"qwerqwer.3QWER",
											"language":"fr"
										})
										.expectStatus(500)
										.end(function(err, res, body) {
											if(err) {
												assert(true);
												return done();
											} else {
												assert(false);
												return done();
											}
										});
								} catch(e) {
									assert(true);
									return done();
								}
							} else {
								assert(false);
								return done();
							}
						}
					});
			});
			it('should not update account with email without first part', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
							return done();
						} else {
							if(body && body.token) {
								try {
									hippie(app, swagger)
										.header('x-access-token',body.token)
										.patch('/api/account')
										.send({
											"name":"abcdef",
											"email":"@test.com",
											"password":"qwerqwer.3QWER",
											"language":"fr"
										})
										.expectStatus(500)
										.end(function(err, res, body) {
											if(err) {
												assert(true);
												return done();
											} else {
												assert(false);
												return done();
											}
										});
								} catch(e) {
									assert(true);
									return done();
								}
							} else {
								assert(false);
								return done();
							}
						}
					});
			});
			it('should not update account with email without second part', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
							return done();
						} else {
							if(body && body.token) {
								try {
									hippie(app, swagger)
										.header('x-access-token',body.token)
										.patch('/api/account')
										.send({
											"name":"abcdef",
											"email":"testy1@.com",
											"password":"qwerqwer.3QWER",
											"language":"fr"
										})
										.expectStatus(500)
										.end(function(err, res, body) {
											if(err) {
												assert(true);
												return done();
											} else {
												assert(false);
												return done();
											}
										});
								} catch(e) {
									assert(true);
									return done();
								}
							} else {
								assert(false);
								return done();
							}
						}
					});
			});
			it('should not update account with email without third part', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
							return done();
						} else {
							if(body && body.token) {
								try {
									hippie(app, swagger)
										.header('x-access-token',body.token)
										.patch('/api/account')
										.send({
											"name":"abcdef",
											"email":"testy1@test.",
											"password":"qwerqwer.3QWER",
											"language":"fr"
										})
										.expectStatus(500)
										.end(function(err, res, body) {
											if(err) {
												assert(true);
												return done();
											} else {
												assert(false);
												return done();
											}
										});
								} catch(e) {
									assert(true);
									return done();
								}
							} else {
								assert(false);
								return done();
							}
						}
					});
			});
			it('should not update account with email with messed up third part', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
					})
					.expectStatus(200)
					.end(function(err, res, body) {
						if (err) {
		 					assert(false);
							return done();
						} else {
							if(body && body.token) {
								try {
									hippie(app, swagger)
										.header('x-access-token',body.token)
										.patch('/api/account')
										.send({
											"name":"abcdef",
											"email":"testy1@test.commmmmmmmmmm",
											"password":"qwerqwer.3QWER",
											"language":"fr"
										})
										.expectStatus(500)
										.end(function(err, res, body) {
											if(err) {
												assert(true);
												return done();
											} else {
												assert(false);
												return done();
											}
										});
								} catch(e) {
									assert(true);
									return done();
								}
							} else {
								assert(false);
								return done();
							}
						}
					});
			});
			it('should not update account with too short password', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
										"password":"aBc1@3",
										"language":"fr"
									})
									.expectStatus(500)
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
								return done();
							}
						}
					});
			});
			it('should not update account with too long password', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
										"password":"aB@01234567890123456789012345678901234567890",
										"language":"fr"
									})
									.expectStatus(500)
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
								return done();
							}
						}
					});
			});
			it('should not update account with password missing lower case', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
										"password":"BADPASSWORD1!",
										"language":"fr"
									})
									.expectStatus(500)
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
								return done();
							}
						}
					});
			});
			it('should not update account with password missing upper case', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
										"password":"badpassword1!",
										"language":"fr"
									})
									.expectStatus(500)
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
								return done();
							}
						}
					});
			});
			it('should not update account with password missing number', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
										"password":"badpassword!!!",
										"language":"fr"
									})
									.expectStatus(500)
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
								return done();
							}
						}
					});
			});
			it('should not update account with password missing symbol', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
										"password":"BadPassword123",
										"language":"fr"
									})
									.expectStatus(500)
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
								return done();
							}
						}
					});
			});
			it('should not update account with a bad language', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
										"language":"badlanguage"
									})
									.expectStatus(500)
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
								return done();
							}
						}
					});
			});
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
			it('should not approve a short name', function(done) {
					hippie(app, swagger)
						.post('/api/account/check/name')
						.send("abc")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!JSON.parse(res.body));
								return done();
							}
						});
			});
			it('should not approve a long name', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/name')
						.send("abcdeABCDEabcdeABCDEabcdeF")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!JSON.parse(res.body));
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
			it('should not approve a name with a space', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/name')
						.send("abc def")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!JSON.parse(res.body));
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
			it('should not approve a name with a symbol', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/name')
						.send("abc*defg")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!JSON.parse(res.body));
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
			it('should not approve an email without @', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/email')
						.send("testytest.com")
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
			it('should not approve an email without .', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/email')
						.send("testy@testcom")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!JSON.parse(res.body));
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
			it('should not approve an email without first part', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/email')
						.send("@test.com")
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
			it('should not approve an email without second part', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/email')
						.send("testy@.com")
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
			it('should not approve an email without third part', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/email')
						.send("testy@test.")
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
			it('should not approve an email with messed up third part', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/email')
						.send("testy@test.commmmmmmmm")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!JSON.parse(res.body));
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
					.send("Testy+123")
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
								assert(!JSON.parse(res.body));
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
			it('should not approve a short password', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/password')
						.send("aBc1@3")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!JSON.parse(res.body));
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
			it('should not approve a long password', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/password')
						.send("aB@0123456678901234567890123456789012345678901234567890")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!JSON.parse(res.body));
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
			it('should not approve a password without lower case letter', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/password')
						.send("BADPASSWORD1!")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!JSON.parse(res.body));
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
			it('should not approve a password without upper case letter', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/password')
						.send("badpassword1!")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!JSON.parse(res.body));
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
			it('should not approve a password without number', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/password')
						.send("BadPassword!!!")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!JSON.parse(res.body));
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
			it('should not approve a password without symbol', function(done) {
				try {
					hippie(app, swagger)
						.post('/api/account/check/password')
						.send("BadPassword123")
						.expectStatus(200)
						.end(function(err, res, body) {
							if(err) {
								assert(false);
								return done();
							} else {
								assert(!JSON.parse(res.body));
								return done();
							}
						});
				} catch(e) {
					assert(true);
					return done();
				}
			});
		});
		describe('Check Language', function() {
			it('should approve a potential language', function(done) {
				hippie(app, swagger)
					.post('/api/account/check/language')
					.send("en")
					.expectStatus(200)
					.end(function(err, res, body) {
						if(err) {
							assert(false);
							return done();
						} else {
							assert(JSON.parse(res.body));
							return done();
						}
					});
			});
			it('should not approve an empty language', function(done) {
				try {
				hippie(app, swagger)
					.post('/api/account/check/language')
					.send("")
					.expectStatus(200)
					.end(function(err, res, body) {
						if(err) {
							assert(true);
							return done();
						} else {
							assert(!JSON.parse(res.body));
							return done();
						}
					});
				} catch(e) {
					assert(true);
					return done();
				}
			});
			it('should not approve a bad language', function(done) {
				hippie(app, swagger)
					.post('/api/account/check/language')
					.send("badlanguage")
					.expectStatus(200)
					.end(function(err, res, body) {
						if(err) {
							assert(true);
							return done();
						} else {
							assert(!JSON.parse(res.body));
							return done();
						}
					});
			});
		});
		describe('Verify Email', function() {

			it('should not verify email first request, without auth token', function(done) {
				hippie(app, swagger)
					.post('/api/signIn')
					.send({
						"name":"testy1",
						"password":"qwerqwer.3QWER"
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
						"password":"qwerqwer.3QWER"
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
						"password":"qwerqwer.3QWER"
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
						"password":"qwerqwer.3QWER"
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
										"password":"qwerqwer.3QWER"
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
						"password":"qwerqwer.3QWER"
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
						"password":"qwerqwer.3QWER"
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
						"password":"qwerqwer.3QWER"
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
								"password":"newpassY+123"
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
								"password":"newpassY+123"
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
								"password":"newpassY+123"
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
								"password":"newpassY+123"
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
			it('should not validate recovery with bad password - too short', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":"aBc1@3"
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
			it('should not validate recovery with bad password - too long', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":"aB!1234567890123456789012345678901234567890"
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
			it('should not validate recovery with bad password - no upper case', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":"badpassword1!"
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
			it('should not validate recovery with bad password - no lower case', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":"BADPASSWORD1!"
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
			it('should not validate recovery with bad password - no number', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":"BadPassword!!!"
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
			it('should not validate recovery with bad password - no symbol', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/deleted')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":"BadPassword123"
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
								"password":"newpassY+123",
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

		describe('Recover Account Password', () => {
			it('should not generate recovery with no email', () => {
				hippie(app, swagger)
					.post('/api/account/recover/password')
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
					.post('/api/account/recover/password')
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
			it('should recover an account - part 1', function(done) {
				when(User.findOne({'name':'testy1'}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/password')
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
							.post('/api/account/recover/password')
							.send({
								"code": user.recovery.code,
								"password":"newpassY+123"
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
							.post('/api/account/recover/password')
							.send({
								"email":'bademail@bad.com',
								"code":user.recovery.code,
								"password":"newpassY+123"
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
							.post('/api/account/recover/password')
							.send({
								"email":user.email,
								"password":"newpassY+123"
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
							.post('/api/account/recover/password')
							.send({
								"email":user.email,
								"code":"badcode",
								"password":"newpassY+123"
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
							.post('/api/account/recover/password')
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
			it('should not validate recovery with bad password - too short', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/password')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":"aBc1@3"
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
			it('should not validate recovery with bad password - too long', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/password')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":"aB@1234567890123456789012345678901234567890"
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
			it('should not validate recovery with bad password - missing lower case', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/password')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":"BADPASSWORD1!"
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
			it('should not validate recovery with bad password - missing upper case', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/password')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":"badpassword1!"
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
			it('should not validate recovery with bad password - missing number', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/password')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":"BadPassword!!!"
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
			it('should not validate recovery with bad password - missing symbol', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app, swagger)
							.post('/api/account/recover/password')
							.send({
								"email":user.email,
								"code":user.recovery.code,
								"password":"BadPassword123"
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
			it('should recover an account - part 2', function(done) {
				when(User.findOne({"name":"testy1"}).exec())
					.then(user => {
						hippie(app,swagger)
							.post('/api/account/recover/password')
							.send({
								"email":user.email,
								"password":"newpassY+123",
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

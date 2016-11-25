var assert = require('assert');
var hippie = require('hippie-swagger');

module.exports = function(app, swagger) {

	describe('Account', function() {

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
	});
};

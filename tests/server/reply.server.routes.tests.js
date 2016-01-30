'use strict';
/* jshint -W079 */ 

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Reply = mongoose.model('Reply'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, reply;

/**
 * Reply routes tests
 */
describe('Reply CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new reply
    user.save(function () {
      reply = {
        title: 'Reply Title',
        content: 'Reply Content'
      };

      done();
    });
  });

  it('should be able to save an reply if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new reply
        agent.post('/api/replies')
          .send(reply)
          .expect(200)
          .end(function (replySaveErr, replySaveRes) {
            // Handle reply save error
            if (replySaveErr) {
              return done(replySaveErr);
            }

            // Get a list of replies
            agent.get('/api/replies')
              .end(function (repliesGetErr, repliesGetRes) {
                // Handle reply save error
                if (repliesGetErr) {
                  return done(repliesGetErr);
                }

                // Get replies list
                var replies = repliesGetRes.body;

                // Set assertions
                (replies[0].user._id).should.equal(userId);
                (replies[0].title).should.match('Reply Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an reply if not logged in', function (done) {
    agent.post('/api/replies')
      .send(reply)
      .expect(403)
      .end(function (replySaveErr, replySaveRes) {
        // Call the assertion callback
        done(replySaveErr);
      });
  });

  it('should not be able to save an reply if no title is provided', function (done) {
    // Invalidate title field
    reply.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new reply
        agent.post('/api/replies')
          .send(reply)
          .expect(400)
          .end(function (replySaveErr, replySaveRes) {
            // Set message assertion
            (replySaveRes.body.message).should.match('Title cannot be blank');

            // Handle reply save error
            done(replySaveErr);
          });
      });
  });

  it('should be able to update an reply if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new reply
        agent.post('/api/replies')
          .send(reply)
          .expect(200)
          .end(function (replySaveErr, replySaveRes) {
            // Handle reply save error
            if (replySaveErr) {
              return done(replySaveErr);
            }

            // Update reply title
            reply.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing reply
            agent.put('/api/replies/' + replySaveRes.body._id)
              .send(reply)
              .expect(200)
              .end(function (replyUpdateErr, replyUpdateRes) {
                // Handle reply update error
                if (replyUpdateErr) {
                  return done(replyUpdateErr);
                }

                // Set assertions
                (replyUpdateRes.body._id).should.equal(replySaveRes.body._id);
                (replyUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of replies if not signed in', function (done) {
    // Create new reply model instance
    var replyObj = new Reply(reply);

    // Save the reply
    replyObj.save(function () {
      // Request replies
      request(app).get('/api/replies')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single reply if not signed in', function (done) {
    // Create new reply model instance
    var replyObj = new Reply(reply);

    // Save the reply
    replyObj.save(function () {
      request(app).get('/api/replies/' + replyObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', reply.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single reply with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/replies/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Reply is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single reply which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent reply
    request(app).get('/api/replies/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No reply with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an reply if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new reply
        agent.post('/api/replies')
          .send(reply)
          .expect(200)
          .end(function (replySaveErr, replySaveRes) {
            // Handle reply save error
            if (replySaveErr) {
              return done(replySaveErr);
            }

            // Delete an existing reply
            agent.delete('/api/replies/' + replySaveRes.body._id)
              .send(reply)
              .expect(200)
              .end(function (replyDeleteErr, replyDeleteRes) {
                // Handle reply error error
                if (replyDeleteErr) {
                  return done(replyDeleteErr);
                }

                // Set assertions
                (replyDeleteRes.body._id).should.equal(replySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an reply if not signed in', function (done) {
    // Set reply user
    reply.user = user;

    // Create new reply model instance
    var replyObj = new Reply(reply);

    // Save the reply
    replyObj.save(function () {
      // Try deleting reply
      request(app).delete('/api/replies/' + replyObj._id)
        .expect(403)
        .end(function (replyDeleteErr, replyDeleteRes) {
          // Set message assertion
          (replyDeleteRes.body.message).should.match('User is not authorized');

          // Handle reply error error
          done(replyDeleteErr);
        });

    });
  });

  it('should be able to get a single reply that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new reply
          agent.post('/api/replies')
            .send(reply)
            .expect(200)
            .end(function (replySaveErr, replySaveRes) {
              // Handle reply save error
              if (replySaveErr) {
                return done(replySaveErr);
              }

              // Set assertions on new reply
              (replySaveRes.body.title).should.equal(reply.title);
              should.exist(replySaveRes.body.user);
              should.equal(replySaveRes.body.user._id, orphanId);

              // force the reply to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the reply
                    agent.get('/api/replies/' + replySaveRes.body._id)
                      .expect(200)
                      .end(function (replyInfoErr, replyInfoRes) {
                        // Handle reply error
                        if (replyInfoErr) {
                          return done(replyInfoErr);
                        }

                        // Set assertions
                        (replyInfoRes.body._id).should.equal(replySaveRes.body._id);
                        (replyInfoRes.body.title).should.equal(reply.title);
                        should.equal(replyInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Reply.remove().exec(done);
    });
  });
});

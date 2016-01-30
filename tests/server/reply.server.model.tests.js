'use strict';
/* jshint -W079 */ 

/**
 * Module dependencies.
 */

var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Reply = mongoose.model('Reply');

/**
 * Globals
 */
var user, reply;

/**
 * Unit tests
 */
describe('Reply Model Unit Tests:', function () {

  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    });

    user.save(function () {
      reply = new Reply({
        content: 'Reply Content',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(10000);
      return reply.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without title', function (done) {
      reply.title = '';

      return reply.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Reply.remove().exec(function () {
      User.remove().exec(done);
    });
  });
});

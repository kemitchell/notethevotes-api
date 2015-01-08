/* jshint mocha: true */
var INTEGRATION = Boolean(process.env.TEST_INTEGRATION);
var supertest = require('supertest');
if (!INTEGRATION) {
  var sinon = require('sinon');
}
var async = require('async');
var app = require('../');
var database = require('../source/database');

var PATH = '/reports/';
var EMAIL = 'someone@somewhere.com';
var PASSWORD = 'badpassword';

describe(PATH, function() {
  describe('POST', function() {
    if (INTEGRATION) {
      var doQuery = require('../source/doQuery');

      beforeEach(function(done) {
        async.parallel([
          doQuery.bind(this, 'TRUNCATE TABLE users RESTART IDENTITY'),
          doQuery.bind(this, 'TRUNCATE TABLE reports RESTART IDENTITY')
        ], done);
      });
    } else {
      beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
      });

      afterEach(function() {
        this.sandbox.restore();
      });
    }

    it('requires HTTP Basic authentication', function(done) {
      supertest(app)
        .post(PATH)
        .expect(401)
        .end(done);
    });

    it('requires valid HTTP Basic authentication', function(done) {
      if (!INTEGRATION) {
        this.sandbox.stub(database, 'authenticateUser')
          .yields(null, false);
      }

      supertest(app)
        .post(PATH)
        .auth(EMAIL, PASSWORD)
        .expect(401)
        .end(done);
    });

    it('accepts valid HTTP Basic authentication', function(done) {
      if (!INTEGRATION) {
        this.sandbox.stub(database, 'insertUser')
          .yields(null);
        this.sandbox.stub(database, 'authenticateUser')
          .yields(null, true);
      }

      async.series([
        function(next) {
          supertest(app)
            .post('/users/' + EMAIL)
            .send({ first: 'John', last: 'Doe', password: PASSWORD })
            .expect(201)
            .end(next);
        },
        function(next) {
          supertest(app)
            .post(PATH)
            .auth(EMAIL, PASSWORD)
            .expect(400)
            .end(next);
        }
      ], done);
    });
  });
});

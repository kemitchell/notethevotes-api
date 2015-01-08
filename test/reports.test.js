/* jshint mocha: true */
var supertest = require('supertest');
var sinon = require('sinon');
var async = require('async');
var app = require('../');
var database = require('../source/database');

var PATH = '/reports/';
var EMAIL = 'someone@somewhere.com';
var PASSWORD = 'badpassword';

describe(PATH, function() {
  describe('POST', function() {
    beforeEach(function() {
      this.sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      this.sandbox.restore();
    });

    it('requires HTTP Basic authentication', function(done) {
      supertest(app)
        .post(PATH)
        .expect(401)
        .end(done);
    });

    it('requires valid HTTP Basic authentication', function(done) {
      this.sandbox.stub(database, 'authenticateUser')
        .yields(null, false);

      supertest(app)
        .post(PATH)
        .auth(EMAIL, PASSWORD)
        .expect(401)
        .end(done);
    });

    it('accepts valid HTTP Basic authentication', function(done) {
      this.sandbox.stub(database, 'insertUser')
        .yields(null);
      this.sandbox.stub(database, 'authenticateUser')
        .yields(null, true);

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

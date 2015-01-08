/* jshint mocha: true */
var supertest = require('supertest');
var async = require('async');
var app = require('../');
var database = require('../source/database');

var PATH = '/reports/';

describe(PATH, function() {
  // Clean the database.
  beforeEach(function(done) {
    database.getClient(function(error, client) {
      client.query('TRUNCATE TABLE users RESTART IDENTITY', done);
    });
  });

  it('requires HTTP Basic authentication', function(done) {
    supertest(app)
      .post(PATH)
      .expect(401)
      .end(done);
  });

  it('requires valid HTTP Basic authentication', function(done) {
    supertest(app)
      .post(PATH)
      .auth('root', 'password')
      .expect(401)
      .end(done);
  });

  it('accepts valid HTTP Basic authentication', function(done) {
    var EMAIL = 'john@doe.com';
    var PASSWORD = 'weakpassword';

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

/* jshint mocha: true */
var supertest = require('supertest');
var async = require('async');
var app = require('../');
var database = require('../source/database');

var PATH = '/users/';

var email = 'john@doe.com';

var makeUser = function() {
  return {
    first: 'John',
    last: 'Doe',
    password: '1234'
  };
};

describe('/users/:email', function() {
  describe('POST', function() {
    // Clean the database.
    beforeEach(function(done) {
      database.getClient(function(error, client) {
        client.query('TRUNCATE TABLE users RESTART IDENTITY', done);
      });
    });

    it('requires a JSON request body', function(done) {
      supertest(app)
        .post(PATH + email)
        .expect(400)
        .expect('Accept', /json/)
        .end(done);
    });

    it('requires a first name', function(done) {
      var body = makeUser();
      delete body.first;
      supertest(app)
        .post(PATH + email)
        .send(body)
        .expect(400)
        .end(done);
    });

    it('requires a last name', function(done) {
      var body = makeUser();
      delete body.last;
      supertest(app)
        .post(PATH + email)
        .send(body)
        .expect(400)
        .end(done);
    });

    it('requires a password', function(done) {
      var body = makeUser();
      delete body.password;
      supertest(app)
        .post(PATH + email)
        .send(body)
        .expect(400)
        .end(done);
    });

    it('responds 201 to a valid request', function(done) {
      supertest(app)
        .post(PATH + email)
        .send(makeUser())
        .expect(201)
        .end(done);
    });

    it('responds 409 if an account already exists', function(done) {
      var body = makeUser();

      async.series([
        function(next) {
          supertest(app)
            .post(PATH + email)
            .send(body)
            .expect(201)
            .end(next);
        },
        function(next) {
          supertest(app)
            .post(PATH + email)
            .send(body)
            .expect(409)
            .end(next);
        }
      ], done);
    });
  });
});

/* jshint mocha: true */
var INTEGRATION = Boolean(process.env.TEST_INTEGRATION);

var supertest = require('supertest');
if (!INTEGRATION) {
  var sinon = require('sinon');
}
var async = require('async');
var app = require('../');
var database = require('../source/database');

var PATH = '/users/';
var EMAIL = 'john@doe.com';

var makeUser = function() {
  return { first: 'John', last: 'Doe', password: '123456' };
};

var without = function(object, property) {
  delete object[property];
  return object;
};

describe('/users/:email', function() {
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

    it('requires a JSON request body', function(done) {
      supertest(app)
        .post(PATH + EMAIL)
        .expect(400)
        .expect('Accept', /json/)
        .end(done);
    });

    it('requires a first name', function(done) {
      var body = without(makeUser(), 'first');
      supertest(app)
        .post(PATH + EMAIL)
        .send(body)
        .expect(400)
        .end(done);
    });

    it('requires a last name', function(done) {
      supertest(app)
        .post(PATH + EMAIL)
        .send(without(makeUser(), 'last'))
        .expect(400)
        .end(done);
    });

    it('requires a password', function(done) {
      supertest(app)
        .post(PATH + EMAIL)
        .send(without(makeUser(), 'password'))
        .expect(400)
        .end(done);
    });

    it('requires a valid email address', function(done) {
      supertest(app)
        .post(PATH + 'not an email address')
        .send(makeUser())
        .expect(400)
        .end(done);
    });

    it('responds 201 to a valid request', function(done) {
      if (!INTEGRATION) {
        this.sandbox.stub(database, 'insertUser').yields(null);
      }

      supertest(app)
        .post(PATH + EMAIL)
        .send(makeUser())
        .expect(201)
        .end(done);
    });

    it('responds 409 if an account already exists', function(done) {
      if (!INTEGRATION) {
        var error = new Error();
        error.sqlState = '23505';
        this.sandbox.stub(database, 'insertUser')
          .onCall(0).yields(null)
          .onCall(1).yields(error);
      }

      var body = makeUser();
      async.series([
        function(next) {
          supertest(app)
            .post(PATH + EMAIL)
            .send(body)
            .expect(201)
            .end(next);
        },
        function(next) {
          supertest(app)
            .post(PATH + EMAIL)
            .send(body)
            .expect(409)
            .end(next);
        }
      ], done);
    });
  });
});

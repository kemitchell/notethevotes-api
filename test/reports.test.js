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
var DATE = 'Fri, 09 Jan 2015 00:00:00 GMT';

describe(PATH, function() {
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

  describe('POST', function() {
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

  describe('GET', function() {
    it('serves stored reports', function(done) {
      var precinct = 1234;
      var report = {
        precinct: precinct,
        elections: [ {
          name: 'Proposition X',
          tallies: [
            { option: 'Yes', votes: 1 },
            { option: 'No', votes: 2 }
          ]
        } ]
      };
      var results = report.elections[0].tallies.map(function(t) {
        var copy = JSON.parse(JSON.stringify(t));
        copy.user = EMAIL;
        copy.timestamp = DATE;
        return copy;
      });

      if (!INTEGRATION) {
        this.sandbox.stub(database, 'insertUser')
          .yields(null);
        this.sandbox.stub(database, 'authenticateUser')
          .yields(null, true);
        this.sandbox.stub(database, 'insertReport')
          .yields(null);
        this.sandbox.stub(Date.prototype, 'toUTCString')
          .returns(DATE);
      }

      async.series([
        // Create a user.
        function(next) {
          supertest(app)
            .post('/users/' + EMAIL)
            .send({ first: 'John', last: 'Doe', password: PASSWORD })
            .expect(201)
            .end(next);
        },
        // Create a report.
        function(next) {
          supertest(app)
            .post(PATH)
            .auth(EMAIL, PASSWORD)
            .send(report)
            .expect(201)
            .end(next);
        },
        // Read back results.
        function(next) {
          supertest(app)
            .get(PATH + 'precincts/' + precinct)
            .expect(200)
            .expect({
              elections: [ { name: 'Proposition X', tallies: results } ]
            })
            .end(next);
        }
      ], done);
    });
  });
});

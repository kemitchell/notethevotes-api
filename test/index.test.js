/* jshint mocha: true */
var supertest = require('supertest');
var app = require('../');
var meta = require('../package.json');

describe('/', function() {
  it('serves API name and version', function(done) {
    supertest(app)
      .get('/')
      .expect({ api: meta.name, version: meta.version })
      .end(done);
  });
});

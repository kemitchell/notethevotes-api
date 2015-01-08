var doQuery = require('../source/doQuery');
var async = require('async');

exports.up = function(done) {
  async.series([
    doQuery.bind(
      this, 'ALTER TABLE reports RENAME COLUMN race TO election'
    ),
    doQuery.bind(this, 'ALTER TABLE reports RENAME TO tallies')
  ], done);
};

exports.down = function(done) {
  async.series([
    doQuery.bind(this, 'ALTER TABLE tallies RENAME TO reports'),
    doQuery.bind(
      this, 'ALTER TABLE reports RENAME COLUMN election TO race'
    )
  ], done);
};

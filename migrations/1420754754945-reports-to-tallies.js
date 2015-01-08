var database = require('../source/database');

var doQuery = function(query) {
  return function(done) {
    database(function(error, client) {
      if (error) {
        done(error);
      } else {
        client.query(query, function(error) {
          done(error || null);
        });
      }
    });
  };
};

exports.up = doQuery(
  'BEGIN;' +
  'ALTER TABLE reports RENAME COLUMN race TO election;' +
  'ALTER TABLE reports RENAME TO tallies;' +
  'COMMIT;'
);

exports.down = doQuery(
  'BEGIN;' +
  'ALTER TABLE tallies RENAME TO reports;' +
  'ALTER TABLE reports RENAME COLUMN election TO race;' +
  'COMMIT;'
);

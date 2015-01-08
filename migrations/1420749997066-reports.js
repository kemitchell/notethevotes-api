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
  'CREATE TABLE reports (' +
  '  id SERIAL PRIMARY KEY,' +
  '  email TEXT NOT NULL,' +
  '  precinct INTEGER NOT NULL,' +
  '  race TEXT NOT NULL,' +
  '  option TEXT NOT NULL,' +
  '  votes INTEGER NOT NULL,' +
  '  time TIMESTAMP NOT NULL,' +
  '  CONSTRAINT uniqueness UNIQUE(email, race, option)' +
  ')'
);

exports.down = doQuery('DROP DATABASE reports');

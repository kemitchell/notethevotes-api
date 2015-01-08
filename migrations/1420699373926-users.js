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
  'CREATE TABLE users (' +
  '  id SERIAL PRIMARY KEY,' +
  '  first TEXT NOT NULL,' +
  '  last TEXT NOT NULL,' +
  '  email TEXT NOT NULL,' +
  '  password CHAR(60) NOT NULL,' +
  '  CONSTRAINT uniqueEmail UNIQUE(email)' +
  ')'
);

exports.down = doQuery('DROP DATABASE users');

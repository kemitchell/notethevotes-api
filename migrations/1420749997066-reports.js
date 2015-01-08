var doQuery = require('../source/doQuery');

exports.up = doQuery.bind(
  this,
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

exports.down = doQuery.bind(this, 'DROP DATABASE reports');

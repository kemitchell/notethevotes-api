var doQuery = require('../source/doQuery');

exports.up = doQuery.bind(
  this,
  'CREATE TABLE users (' +
  '  id SERIAL PRIMARY KEY,' +
  '  first TEXT NOT NULL,' +
  '  last TEXT NOT NULL,' +
  '  email TEXT NOT NULL,' +
  '  password CHAR(60) NOT NULL,' +
  '  CONSTRAINT uniqueEmail UNIQUE(email)' +
  ')'
);

exports.down = doQuery.bind(this, 'DROP DATABASE users');

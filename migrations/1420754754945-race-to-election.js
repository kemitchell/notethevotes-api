var doQuery = require('../source/doQuery');

exports.up = doQuery.bind(
  this, 'ALTER TABLE reports RENAME COLUMN race TO election'
);

exports.down = doQuery.bind(
  this, 'ALTER TABLE reports RENAME COLUMN election TO race'
);

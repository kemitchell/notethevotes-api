var database = require('./database');

module.exports = function(query, callback) {
  database.getClient(function(error, client, releaseClient) {
    if (error) {
      releaseClient();
      callback(error);
    } else {
      client.query(query, function(error) {
        releaseClient();
        callback(error || null);
      });
    }
  });
};

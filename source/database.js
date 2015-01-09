var async = require('async');
var bcrypt = require('bcrypt');
var pg = require('pg').native;

var getClient = exports.getClient = function(callback) {
  var URL = process.env.DATABASE_URL ||
    'postgres://notethevotes@localhost:5433/notethevotes';
  pg.connect(URL, callback);
};

var hashPassword = function(password, callback) {
  // Generate salt.
  bcrypt.genSalt(10, function(error, salt) {
    if (error) {
      callback(error);
    } else {
      // Hash the password.
      bcrypt.hash(password, salt, function(error, hash) {
        if (error) {
          callback(error);
        } else {
          callback(null, hash);
        }
      });
    }
  });
};

var placeholdersToX = function(x) {
  return Array.apply(null, new Array(x)).map(function(x, index) {
    return '$' + (index + 1);
  });
};

exports.insertUser = (function() {
  var queryArgsFromObject = function(object, fields) {
    return fields.reduce(function(mem, field) {
      return mem.concat(object[field]);
    }, []);
  };

  var FIELDS = [ 'first', 'last', 'email', 'password' ];
  var SQL = 'INSERT INTO ' +
    'users (' + FIELDS.join(', ') + ') ' +
    'VALUES (' + placeholdersToX(FIELDS.length) + ')';

  return function(body, callback) {
    hashPassword(body.password, function(error, hash) {
      if (error) {
        callback(error);
      } else {
        body.password = hash;
        getClient(function(error, client, releaseClient) {
          if (error) {
            releaseClient();
            callback(error);
          } else {
            var args = queryArgsFromObject(body, FIELDS);
            client.query(SQL, args, function(error, result) {
              releaseClient();
              callback(error, result);
            });
          }
        });
      }
    });
  };
})();

exports.insertReport = (function() {
  var insertRow =
    function(
      client, email, time,
      precinct, election, option, votes,
      back
    ) {
      client.query(
        'INSERT INTO reports ' +
        '(email, precinct, election, option, votes, time) ' +
        'VALUES (' + placeholdersToX(6) + ')',
        [ email, precinct, election, option, votes, time.toString() ],
        back
      );
    };

  return function(email, body, callback) {
    var time = new Date().toUTCString();
    var precinct = body.precinct;

    getClient(function(error, client, releaseClient) {
      if (error) {
        releaseClient();
        callback(error);
      } else {
        async.series([
          client.query.bind(client, 'BEGIN'),
          function(allDone) {
            async.map(body.elections, function(election, nextElection) {
              var electionName = election.name;
              async.map(election.tallies, function(tally, nextTally) {
                insertRow(
                  client, email, time, precinct, electionName,
                  tally.option, tally.votes,
                  nextTally
                );
              }, nextElection);
            }, allDone);
          }
        ], function(error) {
          if (error) {
            client.query('ROLLBACK', function(rollbackError) {
              releaseClient(rollbackError);
              callback(error);
            });
          } else {
            client.query('COMMIT', function(error) {
              releaseClient();
              callback(error);
            });
          }
        });
      }
    });
  };
})();

exports.authenticateUser = (function() {
  var USER_QUERY = 'SELECT password from users where email=$1';

  return function(email, password, callback) {
    getClient(function(error, client, releaseClient) {
      if (error) {
        releaseClient();
        callback(error);
      } else {
        var args = [ email ];
        client.query(USER_QUERY, args, function(error, result) {
          if (error) {
            releaseClient();
            callback(error);
          } else {
            if (result.rows.length < 1) {
              releaseClient();
              callback(null, false);
            } else {
              var hash = result.rows[0].password;
              bcrypt.compare(password, hash, function(error, same) {
                if (error) {
                  releaseClient();
                  callback(error);
                } else {
                  releaseClient();
                  callback(null, same);
                }
              });
            }
          }
        });
      }
    });
  };
})();

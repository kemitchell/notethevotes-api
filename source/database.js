var bcrypt = require('bcrypt');
var pg = require('pg').native;

var getClient = exports.getClient = function(callback) {
  var URL = process.env.DATABASE_URL ||
    'postgres://notethevotes:notethevotes@localhost:5433/notethevotes';
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

exports.insertUser = (function() {
  var placeholdersToX = function(x) {
    return Array.apply(null, new Array(x)).map(function(x, index) {
      return '$' + (index + 1);
    });
  };

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
        getClient(function(error, client) {
          if (error) {
            callback(error);
          } else {
            var args = queryArgsFromObject(body, FIELDS);
            client.query(SQL, args, callback);
          }
        });
      }
    });
  };
})();

exports.insertReport = (function() {
  return function(body, callback) {
    throw new Error('Not implemented');
  };
})();

var USER_QUERY = 'SELECT password from users where email=$1';

exports.authenticateUser = function(email, password, callback) {
  getClient(function(error, client) {
    if (error) {
      callback(error);
    } else {
      var args = [ email ];
      client.query(USER_QUERY, args, function(error, result) {
        if (error) {
          callback(error);
        } else {
          if (result.rows.length < 1) {
            callback(null, false);
          } else {
            var hash = result.rows[0].password;
            bcrypt.compare(password, hash, function(error, same) {
              if (error) {
                callback(error);
              } else {
                callback(null, same);
              }
            });
          }
        }
      });
    }
  });
};

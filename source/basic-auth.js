var database = require('./database');

module.exports = function(request, response, next) {
  var header = request.headers.authorization;
  if (!header) {
    next();
  } else {
    // Parse the Authorization header.
    var transcoded = new Buffer(
      header.split(' ')[1], 'base64'
    ).toString().split(':');
    var email = transcoded[0];
    var password = transcoded[1];

    database.authenticateUser(email, password, function(error, valid) {
      if (error) {
        response.sendStatus(500);
      } else {
        if (valid) {
          request.user = email;
        }
        next();
      }
    });
  }
};

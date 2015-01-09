var database = require('./database');
var meta = require('../package.json');

var app = require('express')();

// Middleware
// ----------

app.use(require('body-parser').json());

// GET /
// -----

app.get('/', function(request, response) {
  response.json({ api: meta.name, version: meta.version });
});

// POST /users/
// ------------

var validUser = require('./validation/user');

app.post('/users/:email', function(request, response) {
  var body = request.body;
  body.email = request.params.email;
  // Validate provided user details.
  if (!validUser(body)) {
    response.header('Accept', 'application/json');
    response.sendStatus(400);
  } else {
    database.insertUser(body, function(error) {
      if (error) {
        if (error.sqlState === '23505') {
          response.sendStatus(409);
        } else {
          response.sendStatus(500);
        }
      } else {
        response.sendStatus(201);
      }
    });
  }
});

// POST /reports/
// --------------

var authMiddleware = require('./basicAuthMiddleware');

var send401 = function(response) {
  response.header('WWW-Authenticate', 'Basic realm=' + meta.name);
  response.sendStatus(401);
};

var validReport = require('./validation/report');

app.post('/reports/', authMiddleware, function(request, response) {
  if (!request.user) {
    send401(response);
  } else {
    var report = request.body;
    if (!validReport(report)) {
      response.header('Accept', 'application/json');
      response.sendStatus(400);
    } else {
      database.insertReport(request.user, report, function(error) {
        if (error) {
          console.error(error);
          response.sendStatus(500);
        } else {
          response.sendStatus(201);
        }
      });
    }
  }
});

// GET /reports/precincts/:precinct
// --------------------------------

app.get('/reports/precincts/:number', function(request, response) {
  response.sendStatus(200);
});

if (module.parent) {
  // Export for tests.
  module.exports = app;
} else {
  // Start the server.
  app.listen(process.env.PORT || 8080);
}

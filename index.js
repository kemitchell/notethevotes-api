var meta = require('./package.json');

var app = require('express')();

app.use(require('body-parser').json());

app.get('/', function(request, response) {
  response.json({ api: meta.name, version: meta.version });
});

if (module.parent) {
  module.exports = app;
} else {
  app.listen(process.env.PORT || 8080);
}

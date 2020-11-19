var express = require('express');
var bp = require('body-parser');
var cp = require('cookie-parser');
var main = require('./routes/main.js');
var session = require('./middleware/session.js');
var authentication = require('./middleware/authentication.js');
var authorisation = require('./middleware/authorisation.js');

//can be moved to config file later
var config = {
  user: 'sa',
  password: 'Passw0rd',
  server: 'localhost',
  database: 'EmployeePortal',
};
var app = express();

const serverConfig = {
  app: app,
  dbConfig: config,
};
//middlewares
//it watches public folder
app.use(express.static('public'));
app.use(
  bp.urlencoded({
    extended: true,
  })
);
app.use(bp.json());
app.use(cp());
app.use(session);
app.use(
  authentication([
    'notices-sql',
    'employees',
    'departments',
    'issues',
    'profile',
  ])
);
app.use(authorisation([]));

// app.use(authentication([]));
// app.use(authorisation([]));

main.init(serverConfig);

app.get('/test', function (req, res) {
  res.send('hello world');
});
app.listen(3000, function () {
  setInterval(function () {
    var gs = global.sessions;

    if (gs) {
      var prop;
      for (prop in gs) {
        if (Date.now() - gs[prop].lastAccessedOn > 10 * 60 * 1000) {
          delete gs[prop];
        }
      }
    }
  }, 1 * 60 * 60 * 1000);
  console.log('Example app listening on port 3000!');
});

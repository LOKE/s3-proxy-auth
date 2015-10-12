var express = require('express');
var logger = require('morgan');
var path = require('path');
var routes = require('./routes/index');
var favicon = require('serve-favicon');
var basicAuth = require('basic-auth');
var cors = require('cors');
var users = require('./users.json');
var buckets = require('./buckets.json');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(cors());
app.use(logger('dev'));

app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(function auth(req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (users[user.name] && users[user.name].password === user.pass) {
    req.user = users[user.name];
    return next();
  } else {
    return unauthorized(res);
  };
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');

const sessionHandler = require('./auth_jwt');

const app = express();

const accessLogStream = fs.createWriteStream(__dirname + '/logs//access.log', { flags: 'a' })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev', { stream: accessLogStream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionHandler);

app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/users', require('./routes/users'));
app.use('/profile', require('./routes/profile'));
app.use('/keys', require('./routes/keys'));
app.use('/documents', require('./routes/documents'));
app.use('/connections', require('./routes/connections'));
app.use('/authorization', require('./routes/authorization'));
app.use('/signin', require('./routes/signin'));
app.use('/signout', require('./routes/signout'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('error handler');
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

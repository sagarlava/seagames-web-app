// Our Dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var session = require('express-session');

// It allows us to make a request API from different
// domain name (by default they will get blocked if they do the certain requests)
// if you want to set up without this module follow : https://enable-cors.org/server_expressjs.html
const cors = require('cors'); 
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database'); 

// Connect to database
// .database because in the config file you name it database
mongoose.connect(config.database);

// On Connection
mongoose.connection.on('connected', () => {
    console.log('Connected to database '+ config.database);
})

// On Error
mongoose.connection.on('error', (err) => {
    console.log('Database Error '+ err);
})

//Intializing Express
var app = express();


//Require all the Modules
const users = require('./routes/users');
const buses = require('./routes/buses');
var index = require('./routes/index');
var login = require('./routes/login');
const passengersView = require('./routes/passengers');

//routes foAr api
var apiUsers = require('./routes/apis/v1/users');
const trips = require('./routes/apis/v1/trips');
const passengers = require('./routes/apis/v1/passengers');

const notifications = require('./routes/apis/v1/notifications');

//Port Number
const port = 3000;

// CORS Middleware
// We Use the following line So anydomain can access it
app.use(cors());

// Set Static Folder for our Angular
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Passport Middleware
//app.use(passport.initialize());
//app.use(passport.session());

//app.use(session({ secret: 'jhsdkjsahdafh9432953594305', cookie: { maxAge: 60000 }}));
app.use(session({ secret: 'jhsdkjsahdafh9432953594305'}));

require('./config/passport')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(validator([]));

app.use('/', index);
app.use('/users', users);
app.use('/login', login);
app.use('/buses', buses);
app.use('/passengers', passengersView);

app.use('/api/v1/users', apiUsers);
app.use('/api/v1/trip', trips);
app.use('/api/v1/passenger', passengers);
app.use('/api/v1/notifications', notifications);

// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});

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

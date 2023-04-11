require('dotenv').config()
var session = require('express-session')
const passport = require('passport')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require('express-handlebars');
var fileupload = require("express-fileupload");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');


var app = express();

// MongoDB setup Here
const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log("Connected to MongoDB")
  }
})


app.use(fileupload({
  createParentPath: true
  })
);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname + '/views/layout/',partialsDir:__dirname + '/views/partials/'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// express Session codes here
app.use(session({
  secret:"hello_world",
  resave: true,
  saveUninitialized: true,
  cookie:{maxAge:6000000}
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  if (req.isAuthenticated()) {
    res.user = req.session.user;
  }
  next();
});
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
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

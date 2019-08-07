require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose'); // connect to db
const passport = require('passport'); // auth middleware
const flash = require('connect-flash'); // middleware for flash messages stored in the session, to store messages to alert a user after a redirect
// With the flash middleware in place, all requests will have a req.flash() function that can be used for flash messages.
const logger = require('morgan'); // logging
const cookieParser = require('cookie-parser'); // session cookie setup to store flash messages. Parses cookie header and populates req.cookies with cookies
const bodyParser = require('body-parser'); // middleware that adds body object to request object
const session = require('express-session'); // session setup to store flash messages

const app = express();
const router = require('./app/routes.js');

const environment = process.env.NODE_ENV;
const PORT = process.env.PORT || 8000;
const configDB = require('./config/database');

mongoose.connect(configDB.url, {
      useNewUrlParser: true
    }, (err) => {
  if (err) {
    console.log(`Error connecting to ${configDB.url}`);
  } else {
    console.log(`Successfully connected to mongoDB`);
  }
});

// Pass passport into config function for it to be configured
const passportConfig = require('./config/passport');
passportConfig(passport);

// Request logging
if (environment !== 'production') {
  app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended : true
}));


// For flash messages, optional if implentation not for browser
app.use(session({
  secret: 'Quis custodiet ipsos custodes',
  resave: false,
  saveUninitialized: false
}))
app.use(cookieParser());
app.use(flash()); // Special area of the session used for storing messages, i.e. flash messages stores in session

app.set('view engine', 'ejs');

// Initialise passport for express
app.use(passport.initialize());
// Setup passport with persistent login sessions
app.use(passport.session());

// Initialise routes
router(app, passport); // load our routes and pass in our app and fully configured passport

app.listen(PORT, () => {
  console.log(`Server now listening at http://localhost:${PORT}`);
});
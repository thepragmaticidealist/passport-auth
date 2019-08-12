const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GithubStrategy = require('passport-github').Strategy;
const {
  facebookAuth,
  googleAuth,
  githubAuth
} = require('../config/auth');
const User = require('../app/models/user');


module.exports = function (passport) {
  // https: //stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize


  // Serialise user for session
  // id, uniquely identifying the user is stored in the session
  // passport attaches data passed to done fx in req.session.passport.user
  // i.e. req.session.passport.user = { id: 123 }
  passport.serializeUser(function (user, done) {
    // Save user id in session
    done(null, user.id)
  });
  // retrieve user id from session, attach id to req.user object
  passport.deserializeUser(function (id, done) {
    User.findById(id, (err, user) => {
      done(err, user);
    })
  });

  // Use local signup strategy as middleware for all requests to /signup route
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // Passes request object to verify callback
  }, 
  // Verify callback, called when passport authenticates a request
  // Find user that matches credentials
  function (req, email, password, done) {
    User.findOne({ 'local.email': email }, (err, user) => {
        if (err) {
          return done(err);
        } else {
          // Check if user exists
          if (user) {
            // No error, no data, set flash message
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'))
          } else {
            // Create the user
            // Mongoose will invoke bcrypt to hash the password before saving
            const newUser = new User({
              local: {
                email,
                password
              }
            });
            newUser.save((err) => {
              if (err) {
                console.log('Error saving user', err)
                return done(err);
              } else {
                return done(null, newUser);
              }
            })
          }
        }
      })
    })
  )

  // Local login strategy
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // Passes request object to verify callback
  },
  function (req, email, password, done) {
      // Find a user with an email = email
      User.findOne({ 'local.email': email }, async (err, user) => {
        if (err) {
          console.log('Error finding user', err);
          return done(err);
        } else {
          // If no user found with that email,
          if (!user) {
            // done(err, user, optionalmessage)
            return done(null, false, req.flash('loginMessage', 'No user found with that email.'));
          } else {
            // Compare passwords

            // Password isn't valid, no dice
            // We're calling the validPassword method attached to the document
            const passwordIsValid = await user.validPassword(password);
            if (!passwordIsValid) {
              return done(null, false, req.flash('loginMessage', 'Wrong password.'));
            } else {
              // Success, pass user to passport to attach to req.user
              // User passed to serializeUser fx to authenticate succeeding requests
              return done(null, user);
            }
          }
        }
      })
    })
  )

  passport.use('facebook', new FacebookStrategy(
    facebookAuth,
    function (accessToken, refreshToken, profile, done) {
      User.findOne({ 'facebook.id' : profile.id }, (err, user) => {
        if (err) {
          return done(err);
        } else {
          if (user) {
            return done(null, user);
          } else {
            // Create the user
            //http://www.passportjs.org/docs/profile/
            const { id, name, emails } = profile;
            const user = {
              facebook : {
              id,
              token: accessToken,
              email: emails[0].value,
              name: `${name.givenName} ${name.familyName}`
            }}
            const newUser = new User(user);
            newUser.save((err, user) => {
              if (err) {
                return done(err);
              } else {
                return done(null, newUser);
              }
            })
          }
        }
      })
    }
  ))

  passport.use('google', new GoogleStrategy(
    googleAuth,
    function (accessToken, refreshToken, profile, done) {
      User.findOne({'google.id': profile.id }, (err, user) => {
        if (err) {
          return done(err);
        } else if (user) {
          return done(null, user);
        } else {
          const { id, displayName, emails } = profile;
          const user = {
            google: {
              id,
              token: accessToken,
              email: emails[0].value,
              name: `${displayName}`
            }
          };
          const newUser = new User(user);
          newUser.save((err, user) => {
            if (err) {
              return done(err);
            } else {
              return done(null, newUser);
            }
          })
        }
      })
    }
  ))
  
  passport.use('github', new GithubStrategy(
    githubAuth,
    function (accessToken, refreshToken, profile, done) {
      User.findOne({'github.id': profile.id }, (err, user) => {
        if (err) {
          return done(err);
        } else if (user) {
          return done(null, user);
        } else {
          const { id, displayName, emails, profileUrl } = profile;
          const user = {
            github: {
              id,
              token: accessToken,
              email: emails ? emails[0].value : profileUrl,
              name: `${displayName}`
            }
          };
          const newUser = new User(user);
          newUser.save((err, user) => {
            if (err) {
              return done(err);
            } else {
              return done(null, newUser);
            }
          })
        }
      })
    }
  ))
}
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

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
    if (!req.user) {
      User.findOne({ 'local.email': email }, (err, user) => {
          if (err) {
            return done(err);
          } else {
            // Check if user exists
            if (user) {
              // No error, no data, set flash message
              return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {
              // Create the user
              const newUser = new User();
              const details = {
                email,
                password: bcrypt.hashSync(password, 10)
              };
              newUser.local = details;
              // Pass a flag that sets up that method of auth as the current one being used
              newUser.currentAuthenticationMethod = 'local';
              newUser.save((err, user) => {
                if (err) {
                  return done(err);
                } else {
                  console.log('LOCAL SIGNUP USER, NO SESSION &&&&', user)
                  return done(null, user);
                }
              })
            }
          }
        })
    } else {
      // Link user to a/c
      const user = req.user;
      // Hash password
      const localCreds = {
        email,
        password: bcrypt.hashSync(password, 10)
      }
      user.local = localCreds;
      user.currentAuthenticationMethod = 'local';
      user.save((err, _user) => {
        if (err) {
          return done(err);
        } else {
          console.log('LOCAL USER ####', user);
          return done(null, user);
        }
      })
    }
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
              // Pass attrib to det current auth method
              user.currentAuthenticationMethod = 'local';
              return done(null, user);
            }
          }
        }
      })
    })
  )

  passport.use('facebook', new FacebookStrategy(
    Object.assign({}, facebookAuth, { passReqToCallback: true }),
    function (req, accessToken, _refreshToken, profile, done) {
      // User not logged in
      if (!req.user) {
        User.findOne({ 'facebook.id' : profile.id }, (err, user) => {
          if (err) {
            return done(err);
          } else {
            if (user) {
              // Previously unlinked a/c
              if (!user.facebook.token) {
                const { name, emails } = profile;
                const facebookCreds = {
                  token: accessToken,
                  email: emails[0].value,
                  name: `${name.givenName} ${name.familyName}`
                }
                user.facebook = facebookCreds;
                user.currentAuthenticationMethod = 'facebook';
                user.save((err, _user) => {
                  if (err) {
                    return done(err);
                  } else {
                    console.log('FACEBOOK USER PREVIOUSLY LINKED >>>', user)
                    return done(null, user);
                  }
                })
              }
              // Account still linked
              user.currentAuthenticationMethod = 'facebook';
              console.log('USER STILL LINKED ++++', user)
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
              }};
              const newUser = new User(user);
              newUser.currentAuthenticationMethod = 'facebook';
              newUser.save((err, _user) => {
                if (err) {
                  return done(err);
                } else {
                  console.log('USER *****', newUser)
                  return done(null, newUser);
                }
              })
            }
          }
        })
      } else {
        // User already looged in, connect their account
        const  { emails, name, id } = profile;
        const user = req.user; // Current user object in session
        const facebookCreds = {
          id,
          token: accessToken,
          email: emails[0].value,
          name: `${name.givenName} ${name.familyName}`
        }
        user.facebook = facebookCreds;
        user.currentAuthenticationMethod = 'facebook';
        user.save((err, _user) => {
          if (err) {
            return done(err);
          } else {
            return done(null, user);
          }
        })
      }
    }
  ));

  passport.use('google', new GoogleStrategy(
    Object.assign({}, googleAuth, { passReqToCallback: true }),
    function (req, accessToken, _refreshToken, profile, done) {
      if (!req.user) {
        User.findOne({'google.id': profile.id }, (err, user) => {
          if (err) {
            return done(err);
          } else if (user) {
             if (!user.google.token) {
               const { displayName, emails } = profile;
               const googleCreds = {
                 token: accessToken,
                 email: emails[0].value,
                 name: `${displayName}`
               }
               user.google = googleCreds;
               user.currentAuthenticationMethod = 'google';
               user.save((err, _user) => {
                 if (err) {
                   return done(err);
                 } else {
                   return done(null, user);
                 }
               })
             }
             user.currentAuthenticationMethod = 'google';
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
            newUser.currentAuthenticationMethod = 'google';
            newUser.save((err, _user) => {
              if (err) {
                return done(err);
              } else {
                return done(null, newUser);
              }
            })
          }
        })
      } else {
        const { id, displayName, emails } = profile;
        const user = req.user;
        const googleCreds = {
          id,
          token: accessToken,
          email: emails[0].value,
          name: `${displayName}`
        };
        user.google = googleCreds;
        user.currentAuthenticationMethod = 'google';
        user.save((err, _user) => {
          if (err) {
            return done(err);
          } else {
            return done(null, user);
          }
        })
      }
    }
  ));
  
  passport.use('github', new GithubStrategy(
    Object.assign({}, githubAuth, { passReqToCallback: true }),
    function (req, accessToken, _refreshToken, profile, done) {
      if (!req.user) {
        User.findOne({'github.id': profile.id }, (err, user) => {
          if (err) {
            return done(err);
          } else if (user) {
             if (!user.github.token) {
               const { displayName, emails, profileUrl } = profile;
               const githubCreds = {
                 token: accessToken,
                 email: emails ? emails[0].value : profileUrl,
                 name: `${displayName}`
               }
               user.github = githubCreds;
               user.currentAuthenticationMethod = 'github';
               user.save((err, _user) => {
                 if (err) {
                   return done(err);
                 } else {
                   return done(null, user);
                 }
               })
             }
            user.currentAuthenticationMethod = 'github';
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
            newUser.currentAuthenticationMethod = 'github';
            newUser.save((err, _user) => {
              if (err) {
                return done(err);
              } else {
                return done(null, newUser);
              }
            })
          }
        })
      } else {
        const { id, displayName, emails, profileUrl } = profile;
          const user = req.user;
          const githubCreds = {
            id,
            token: accessToken,
            email: emails ? emails[0].value : profileUrl,
            name: `${displayName}`
          };
          user.github = githubCreds;
          user.currentAuthenticationMethod = 'github';
          user.save((err, _user) => {
            if (err) {
              return done(err);
            } else {
              return done(null, user);
            }
          })
      }
    }
  ));
}
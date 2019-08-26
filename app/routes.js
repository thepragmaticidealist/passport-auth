// Route managing niddleware function

module.exports = (app, passport) => {

  app.get('/', (_req, res, _next) => {
    res.render('index.ejs');
  });

  // Handle get requests to /login
  app.get('/login', (req, res, _next) => {
    // all requests will have a req.flash()
    // pass a local variable i.e. the login flash message to the view
    res.render('login.ejs', { 
      message: req.flash('loginMessage')
    });
  });

  // Handle post requests to /login
  // Use passport local strategy as middleware
  app.post('/login', 
  // passport auth middleware
    passport.authenticate('local-login', {
      successRedirect: '/profile',
      failureRedirect: '/login',
      failureFlash: true // Flash error message given by the verify callback
    })
  );

  app.get('/signup', (req, res, _next) => {
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });

  app.post('/signup',
  // Passport sign up flow
  passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
    })
  );

  // CONNECT LOCAL A/C

  // Authorise local a/c
  app.get('/auth/local/connect', (req, res, _next) => {
    res.render('connect-local.ejs', {
      message: req.flash('loginMessage')
    });
  });


  app.post('/auth/local/connect',
    // passport auth middleware
    passport.authorize('local-signup', {
      successRedirect: '/profile',
      failureRedirect: '/auth/local/connect',
      failureFlash: true // Flash error message given by the verify callback
    })
  );

  // Only allow logged in users to visit/get this page
  // We use the middleware function authenticationCheck to evaluate this
  app.get('/profile', authenticationCheck, (req, res, _next) => {
    res.render('profile.ejs', {
      user: req.user // Pass authenticated user from passport to our profile page template
    });
  });

  app.get('/logout', (req, res, _next) => {
    req.logout(); // Provided by passport
    res.redirect('/');
  });

  // -----------------------
  // AUTHENTICATE WITH FACEBOOK

  // Send the user to fb for authentication
  app.get('/auth/facebook', 
    passport.authenticate('facebook',
    {
      // We need additional permission for profile info
      // so we pass in the scope option
      scope: ['public_profile', 'email'],
      // re-ask for for declined permissions
      authType: 'reauthenticate'
    })
  );

  // Redirect URL we passed to passport facebook strategy middleware
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/',
      failureFlash: true
    })
  );


  // CONNECT FACEBOOK A/C

  // Send to fb for authorization
  app.get('/auth/facebook/connect',
    passport.authorize('facebook', {
      // We need additional permission for profile info
      // so we pass in the scope option
      scope: ['public_profile', 'email'],
      // re-ask for for declined permissions
      authType: 'reauthenticate'
    })
  );
  
  // Callback from fb on successful authorization
  app.get('/auth/facebook/connect/callback',
    passport.authorize('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/',
      failureFlash: true
    })
  )


  // ------------------
  // AUTHETICATE WITH GOOGLE
  
   // Send the user to google for authentication
   app.get('/auth/google',
     passport.authenticate('google', {
       // We need data from the user's profile
       // so we pass in the scope option
      //  scope: ['https://www.googleapis.com/auth/plus.login', 'email']
       scope: ['profile', 'email']
     })
   );

   // Redirect URL we passed to passport google strategy middleware
   app.get('/auth/google/callback',
     passport.authenticate('google', {
       successRedirect: '/profile',
       failureRedirect: '/',
       failureFlash: true
     })
   )

   // ------------------
  // AUTHORIZE GOOGLE A/C

   // Send to google to authorize
   app.get('/auth/google/connect',
     passport.authorize('google', {
       scope: ['public_profile', 'email'],
       // re-ask for for declined permissions
       authType: 'reauthenticate'
     })
   )

  // Redirect from google
   app.get('/auth/google/connect/callback',
     passport.authorize('google', {
       successRedirect: '/profile',
       failureRedirect: '/',
       failureFlash: true
     })
   )


  // ------------------
  // AUTHETICATE WITH GITHUB

   // Send the user to github for authentication
   app.get('/auth/github',
     passport.authenticate('github', {
       // We need data from the user's profile
       // so we pass in the scope option
      //  scope: ['profile', 'email']
     })
   );


   // Redirect URL we passed to passport google strategy middleware
   app.get('/auth/github/callback',
     passport.authenticate('github', {
       successRedirect: '/profile',
       failureRedirect: '/',
       failureFlash: true
     })
   )

   // CONNECT GITHUB A/C
  
   // Send the user to github for authentication
   app.get('/auth/github/connect',
     passport.authorize('github', {
       // We need data from the user's profile
       // so we pass in the scope option
      //  scope: ['profile', 'email']
     })
   );

   // Redirect URL we passed to passport google strategy middleware
   app.get('/auth/github/connect/callback',
     passport.authorize('github', {
       successRedirect: '/profile',
       failureRedirect: '/',
       failureFlash: true
     })
   )
}



/**
 * Middleware to check whether a user is authenticated
 * If authenticated, the method passes control to the next handler
 * If not, the user is redirected to '/'
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const authenticationCheck = (req, res, next) => {
  // isAuthenticated = passport function to check whether a user is authenticated or not
  req.isAuthenticated() ? next() : res.redirect('/');
}
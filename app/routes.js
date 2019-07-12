// Route managing niddleware function

module.exports = (app, passport) => {
  // Home
  app.get('/', (req, res, next) => {
    res.render('index.ejs')
  });

  // Handle get requests to /login
  app.get('/login', (req, res, next) => {
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
      failureRedirect: '/signup',
      failureFlash: true
    })
  );

  app.get('/signup', (req, res, next) => {
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

  // Only allow logged in users to visit/get this page
  // We use the middleware function authenticationCheck to evaluate this
  app.get('/profile', authenticationCheck, (req, res, next) => {
    res.render('profile.ejs', {
      user: req.user
    });
  });

  app.get('/logout', (req, res, next) => {
    req.logout(); // Provided by passport
    res.redirect('/login');
  });
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
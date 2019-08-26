module.exports = {
  local: (req, res, _next) => {
    const user = req.user;
    user.email = null;
    user.password = null;
    newUser.save(err => {
      res.redirect('/profile')
    })
  },

  facebook: (req, res, _next) => {
    const user = req.user;
    user.facebook.token = null;
    newUser.save(err => {
      res.redirect('/profile')
    })
  },

  google: (req, res, _next) => {
    const user = req.user;
    user.google.token = null;
    newUser.save(err => {
      res.redirect('/profile')
    })
  },

  github: (req, res, _next) => {
    const user = req.user;
    user.github.token = null;
    newUser.save(err => {
      res.redirect('/profile')
    })
  }
}
module.exports = {
  local: (req, res, _next) => {
    const user = req.user;
    user.local.email = null;
    user.local.password = null;
    user.save(err => res.redirect('/profile'))
  },

  facebook: (req, res, _next) => {
    const user = req.user;
    user.facebook.token = null;
    user.save(err =>  res.redirect('/profile'))
  },

  google: (req, res, _next) => {
    const user = req.user;
    user.google.token = null;
    user.save(err => res.redirect('/profile'))
  },

  github: (req, res, _next) => {
    const user = req.user;
    user.github.token = null;
    user.save(err => res.redirect('/profile'))
  }
}
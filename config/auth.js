module.exports = {
  facebook: {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileURL: 'https://graph.facebook.com/v4.0/me?fields=first_name,last_name,email'
  },
  google: {
    callbackURL: 'http://localhost:8000/auth/google/callback'
  },
  github: {

  }
}
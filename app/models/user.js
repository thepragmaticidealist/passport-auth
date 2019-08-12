const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const saltingRounds = 10;

// schema maps to a collection, defines attributes of documents within collection
const Schema = mongoose.Schema;

const userSchema = new Schema({
  local: {
    email: {
      type: 'String'
    },
    password: {
      type: 'String'
    }
  },
  google: {
    id: {
      type: 'String'
    },
    token: {
      type: 'String'
    },
    email: {
      type: 'String'
    },
    name: {
      type: 'String'
    }
  },
  facebook: {
    id: {
      type: 'String'
    },
    token: {
      type: 'String'
    },
    email: {
      type: 'String'
    },
    name: {
      type: 'String'
    }
  },
  twitter: {
    id: {
      type: 'String'
    },
    token: {
      type: 'String'
    },
    email: {
      type: 'String'
    },
    name: {
      type: 'String'
    }
  },
});

// encrypt password before save
userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified || !user.isNew) { // Don't rehash if it's an old user
    next();
  } else if (!user.hasOwnProperty('local')) { // Don't hash if the user is local
    next();
  } else {
    bcrypt.hash(user.local.password, saltingRounds, function (err, hash) {
      if (err) {
        console.log('Error hashing password for user', user.email);
        next(err);
      } else {
        user.local.password = hash;
        next();
      }
    });
  }
});

// Returns a promise that resolves to true if a password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compare(password, this.local.password);
}

module.exports = mongoose.model('User', userSchema);
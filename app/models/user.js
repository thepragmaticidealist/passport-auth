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
  github: {
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


// Returns a promise that resolves to true if a password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compare(password, this.local.password);
}


module.exports = mongoose.model('User', userSchema);
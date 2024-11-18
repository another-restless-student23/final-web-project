const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    minlength: 3, 
    maxlength: 30 
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  },
  firstName: { 
    type: String, 
    required: true, 
    maxlength: 50 
  },
  lastName: { 
    type: String, 
    required: true, 
    maxlength: 50 
  },
  age: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 120 
  },
  gender: { 
    type: String, 
    required: true, 
    enum: ['Male', 'Female', 'Other']  // Only allow these values
  },
  role: { 
    type: String, 
    default: 'editor', 
    enum: ['admin', 'editor']  // Only allow these roles
  },
  twoFactorEnabled: { 
    type: Boolean, 
    default: false 
  },
  twoFactorSecret: { 
    type: String 
  }
});

// Hash password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords during login
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate 2FA secret
userSchema.methods.generateTwoFactorSecret = function () {
  const secret = speakeasy.generateSecret();
  this.twoFactorSecret = secret.base32;  // Store the secret in the database
  return secret;
};

// Verify 2FA code
userSchema.methods.verifyTwoFactorCode = function (token) {
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token
  });
};

module.exports = mongoose.model('User', userSchema);
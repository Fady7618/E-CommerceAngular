const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      // Not required for OAuth users
    },
    phone: {
      type: String,
      default: ''
    },
    profile_image: {
      type: String,
      default: ''
    },
    google_id: {
      type: String,
      sparse: true // Allows multiple null values but enforces uniqueness for non-null
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
      }
    ],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving (skip for OAuth users)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return this.password ? await bcrypt.compare(enteredPassword, this.password) : false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
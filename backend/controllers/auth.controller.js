const User = require('../models/user.model');
const { generateToken } = require('../services/token.service');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

// Create OAuth client
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === 'production'
    ? process.env.GOOGLE_CALLBACK_URL_PRODUCTION
    : process.env.GOOGLE_CALLBACK_URL
);

/**
 * Register a new user with email and password
 */
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'Error',
        message: 'User already exists'
      });
    }

    // Create new user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      phone,
      provider: 'local'
    });

    // Generate token
    const token = generateToken(user._id);

    // Return user data and token
    res.status(201).json({
      status: 'Success',
      data: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        profile_image: user.profile_image,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
};

/**
 * Login with email and password
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'Error',
        message: 'Invalid email or password'
      });
    }

    // Check if user is using OAuth
    if (user.provider === 'google' && !user.password) {
      return res.status(400).json({
        status: 'Error',
        message: 'Please log in with Google'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'Error',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      status: 'Success',
      data: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        profile_image: user.profile_image,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
};

/**
 * Handle Google OAuth authorization code
 */
exports.googleAuth = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        status: 'Error',
        message: 'Authorization code is required'
      });
    }
    
    // Exchange code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    const { id_token, access_token } = tokens;
    
    // Get user info from Google
    const googleUser = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    );
    
    const { sub, email, given_name, family_name, picture } = googleUser.data;
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create a new user
      user = await User.create({
        first_name: given_name || '',
        last_name: family_name || '',
        email,
        google_id: sub,
        profile_image: picture || '',
        provider: 'google'
      });
    } else if (!user.google_id) {
      // Link Google account to existing user
      user.google_id = sub;
      user.provider = 'google';
      if (!user.profile_image && picture) {
        user.profile_image = picture;
      }
      await user.save();
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Return user data and token
    res.json({
      status: 'Success',
      data: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        profile_image: user.profile_image,
        token
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'Error',
        message: 'User not found'
      });
    }
    
    res.json({
      status: 'Success',
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
};
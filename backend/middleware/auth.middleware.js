const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/keys');
const User = require('../models/user.model');

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (err) {
    return null;
  }
};

/**
 * Middleware to protect routes - verifies JWT and attaches user to request
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    // Check Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Fallback to cookie
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    console.log('Token:', token);

    if (!token) {
      return res.status(401).json({ status: 'Error', message: 'Not authorized to access this route' });
    }

    const decoded = exports.verifyToken(token);
    console.log('Decoded:', decoded);

    if (!decoded) {
      return res.status(401).json({ status: 'Error', message: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.id).select('-password');
    console.log('User:', user);

    if (!user) {
      return res.status(401).json({ status: 'Error', message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ status: 'Error', message: 'Not authorized to access this route' });
  }
};

/**
 * Middleware to restrict routes to specific user roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'Error',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};
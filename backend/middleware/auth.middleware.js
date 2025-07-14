const { verifyToken } = require('../services/token.service');
const User = require('../models/user.model');

/**
 * Middleware to protect routes - verifies JWT and attaches user to request
 */
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'Error',
        message: 'Not authorized to access this route'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        status: 'Error',
        message: 'Invalid or expired token'
      });
    }
    
    // Check if user exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'Error',
        message: 'User not found'
      });
    }
    
    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      status: 'Error',
      message: 'Not authorized to access this route'
    });
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
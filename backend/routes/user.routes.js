const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

// Protected routes
router.use(authMiddleware.protect);

/**
 * @route GET /api/users/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', async (req, res) => {
  try {
    res.json({
      status: 'Success',
      data: {
        customer_id: req.user._id,
        customer_first_name: req.user.first_name,
        customer_last_name: req.user.last_name,
        customer_email: req.user.email,
        customer_phone: req.user.phone,
        profile_image: req.user.profile_image,
        provider: req.user.provider
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

module.exports = router;
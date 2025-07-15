const User = require('../models/user.model'); // Adjust path if needed

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ status: 'Error', message: 'User not found' });
    }
    res.json({
      status: 'Success',
      data: {
        customer_id: user._id,
        customer_first_name: user.first_name,
        customer_last_name: user.last_name,
        customer_email: user.email,
        customer_phone: user.phone,
        profile_image: user.profile_image,
        provider: user.provider
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: error.message });
  }
};
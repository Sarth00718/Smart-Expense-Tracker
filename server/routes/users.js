const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, email, picture } = req.body;

    // Validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = email.toLowerCase();
    }

    // Update user fields
    user.fullName = fullName.trim();
    if (picture !== undefined) {
      user.picture = picture;
    }

    await user.save({ validateBeforeSave: false });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        picture: user.picture,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/users/preferences
 * Get user preferences
 */
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('preferences');
    
    res.json({
      preferences: user.preferences || {
        theme: 'auto',
        colorScheme: 'blue'
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

/**
 * PATCH /api/users/preferences
 * Update user preferences
 */
router.patch('/preferences', auth, async (req, res) => {
  try {
    const { theme, colorScheme } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize preferences if not exists
    if (!user.preferences) {
      user.preferences = {};
    }

    // Update preferences
    if (theme) {
      if (!['light', 'dark', 'auto'].includes(theme)) {
        return res.status(400).json({ error: 'Invalid theme value' });
      }
      user.preferences.theme = theme;
    }

    if (colorScheme) {
      if (!['blue', 'green', 'purple', 'orange', 'pink'].includes(colorScheme)) {
        return res.status(400).json({ error: 'Invalid color scheme value' });
      }
      user.preferences.colorScheme = colorScheme;
    }

    await user.save();

    res.json({
      preferences: user.preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;

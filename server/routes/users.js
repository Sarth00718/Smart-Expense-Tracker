const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

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

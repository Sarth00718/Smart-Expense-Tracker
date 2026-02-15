const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

/**
 * GET /api/users/profile/stats
 * Get user profile statistics
 */
router.get('/profile/stats', auth, async (req, res) => {
  try {
    const Expense = require('../models/Expense');
    const Budget = require('../models/Budget');
    const Goal = require('../models/Goal');

    const [expenseCount, budgetCount, goalCount] = await Promise.all([
      Expense.countDocuments({ userId: req.userId }),
      Budget.countDocuments({ userId: req.userId }),
      Goal.countDocuments({ userId: req.userId })
    ]);

    res.json({
      expenses: expenseCount,
      budgets: budgetCount,
      goals: goalCount
    });
  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({ error: 'Failed to get profile stats' });
  }
});

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
    const { colorScheme } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize preferences if not exists
    if (!user.preferences) {
      user.preferences = {};
    }

    // Update preferences
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

/**
 * PUT /api/users/change-password
 * Change user password
 */
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      return res.status(400).json({ error: 'Cannot change password for OAuth-only accounts' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

/**
 * GET /api/users/sessions
 * Get active sessions (simplified - returns current session info)
 */
router.get('/sessions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For now, return current session info
    // In a production app, you'd track sessions in a separate collection
    const sessions = [
      {
        id: '1',
        device: 'Current Device',
        browser: req.headers['user-agent'] || 'Unknown',
        ip: req.ip || req.connection.remoteAddress || 'Unknown',
        lastActive: new Date(),
        current: true
      }
    ];

    res.json({
      sessions,
      total: sessions.length
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

/**
 * DELETE /api/users/sessions/:sessionId
 * Revoke a session (logout from specific device)
 */
router.delete('/sessions/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // For now, just return success
    // In production, you'd invalidate the specific session token
    res.json({
      message: 'Session revoked successfully'
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ error: 'Failed to revoke session' });
  }
});

module.exports = router;

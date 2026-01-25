const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const auth = require('../middleware/auth');
const { checkAndAwardAchievements, getBadgeInfo } = require('../utils/achievements');

// @route   GET /api/achievements
// @desc    Get user achievements
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Check for new achievements
    const newAchievements = await checkAndAwardAchievements(req.userId);

    // Get all earned achievements
    const achievements = await Achievement.find({ userId: req.userId })
      .sort({ earnedAt: -1 });

    const result = achievements.map(ach => {
      const info = getBadgeInfo(ach.badgeName);
      return {
        badgeName: ach.badgeName,
        badgeType: ach.badgeType,
        title: info.title,
        icon: info.icon,
        description: info.description,
        earnedAt: ach.earnedAt
      };
    });

    res.json({
      earned: result,
      new: newAchievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

module.exports = router;

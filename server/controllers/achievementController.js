const Achievement = require('../models/Achievement');
const { checkAndAwardAchievements, getBadgeInfo } = require('../utils/achievements');

// @desc    Get user achievements
// @access  Private
exports.getAchievements = async (req, res) => {
  try {
    const newAchievements = await checkAndAwardAchievements(req.userId);

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
};

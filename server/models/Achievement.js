const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  badgeName: {
    type: String,
    required: true,
    enum: [
      'first_expense',
      'expense_master',
      'category_explorer',
      'goal_achiever',
      'budget_master',
      'super_saver',
      'tracking_streak_7',
      'receipt_pro'
    ]
  },
  badgeType: {
    type: String,
    required: true,
    enum: ['milestone', 'achievement', 'streak']
  },
  earnedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Unique constraint: one badge per user
achievementSchema.index({ userId: 1, badgeName: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);

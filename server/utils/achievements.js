const Achievement = require('../models/Achievement');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

const BADGE_INFO = {
  first_expense: {
    title: 'First Step',
    icon: '🎯',
    description: 'Added your first expense'
  },
  expense_master: {
    title: 'Expense Master',
    icon: '📊',
    description: 'Added 50+ expenses'
  },
  category_explorer: {
    title: 'Category Explorer',
    icon: '🗂️',
    description: 'Used 5+ categories'
  },
  goal_achiever: {
    title: 'Goal Achiever',
    icon: '🎖️',
    description: 'Completed a savings goal'
  },
  budget_master: {
    title: 'Budget Master',
    icon: '💰',
    description: 'Stayed under all budgets'
  },
  super_saver: {
    title: 'Super Saver',
    icon: '🏆',
    description: 'Saved 20%+ of income'
  },
  tracking_streak_7: {
    title: '7-Day Tracking Streak',
    icon: '🔥',
    description: 'Tracked expenses for 7 days'
  },
  receipt_pro: {
    title: 'Receipt Pro',
    icon: '📸',
    description: 'Scanned 5+ receipts'
  }
};

function getBadgeInfo(badgeName) {
  return BADGE_INFO[badgeName] || {
    title: badgeName,
    icon: '🏅',
    description: 'Achievement earned'
  };
}

async function checkAndAwardAchievements(userId) {
  const newAchievements = [];

  try {
    // Get existing achievements
    const existing = await Achievement.find({ userId });
    const existingBadges = existing.map(a => a.badgeName);

    // Check first expense
    const expenseCount = await Expense.countDocuments({ userId });
    
    if (expenseCount >= 1 && !existingBadges.includes('first_expense')) {
      await awardBadge(userId, 'first_expense', 'milestone');
      newAchievements.push('first_expense');
    }

    // Check expense master (50+ expenses)
    if (expenseCount >= 50 && !existingBadges.includes('expense_master')) {
      await awardBadge(userId, 'expense_master', 'milestone');
      newAchievements.push('expense_master');
    }

    // Check category explorer (5+ categories)
    const categories = await Expense.distinct('category', { userId });
    if (categories.length >= 5 && !existingBadges.includes('category_explorer')) {
      await awardBadge(userId, 'category_explorer', 'milestone');
      newAchievements.push('category_explorer');
    }

    // Check goal achiever
    const completedGoals = await Goal.countDocuments({
      userId,
      $expr: { $gte: ['$currentAmount', '$targetAmount'] }
    });

    if (completedGoals >= 1 && !existingBadges.includes('goal_achiever')) {
      await awardBadge(userId, 'goal_achiever', 'milestone');
      newAchievements.push('goal_achiever');
    }

    // Check budget master
    const budgets = await Budget.find({ userId });
    if (budgets.length >= 3 && !existingBadges.includes('budget_master')) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      let allUnderBudget = true;
      
      for (const budget of budgets) {
        const spent = await Expense.aggregate([
          {
            $match: {
              userId,
              category: budget.category,
              date: { $gte: startOfMonth }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const totalSpent = spent[0]?.total || 0;
        if (totalSpent > budget.monthlyBudget) {
          allUnderBudget = false;
          break;
        }
      }

      if (allUnderBudget) {
        await awardBadge(userId, 'budget_master', 'achievement');
        newAchievements.push('budget_master');
      }
    }

    // Check tracking streak (7 days)
    if (!existingBadges.includes('tracking_streak_7')) {
      const recentExpenses = await Expense.find({ userId })
        .sort({ date: -1 })
        .limit(30);

      const uniqueDates = new Set(
        recentExpenses.map(exp => exp.date.toISOString().split('T')[0])
      );

      if (uniqueDates.size >= 7) {
        await awardBadge(userId, 'tracking_streak_7', 'streak');
        newAchievements.push('tracking_streak_7');
      }
    }

  } catch (error) {
    console.error('Error checking achievements:', error);
  }

  return newAchievements;
}

async function awardBadge(userId, badgeName, badgeType) {
  try {
    const achievement = new Achievement({
      userId,
      badgeName,
      badgeType
    });
    await achievement.save();
  } catch (error) {
    if (error.code !== 11000) { // Ignore duplicate key errors
      console.error('Error awarding badge:', error);
    }
  }
}

module.exports = {
  checkAndAwardAchievements,
  getBadgeInfo
};

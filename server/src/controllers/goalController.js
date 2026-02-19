import Goal from '../models/Goal.js';

// @desc    Add savings goal
// @access  Private
export const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline } = req.body;

    if (!name || !targetAmount) {
      return res.status(400).json({ error: 'Name and target amount are required' });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({ error: 'Target amount must be positive' });
    }

    const goal = new Goal({
      userId: req.userId,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: deadline ? new Date(deadline) : null
    });

    await goal.save();

    res.status(201).json(goal);
  } catch (error) {
    console.error('Add goal error:', error);
    res.status(500).json({ error: 'Failed to add goal' });
  }
};

// @desc    Get goals statistics
// @access  Private
export const getStats = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId });

    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallPercentage = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    res.json({
      total_goals: totalGoals,
      completed_goals: completedGoals,
      total_target: Math.round(totalTarget * 100) / 100,
      total_current: Math.round(totalCurrent * 100) / 100,
      overall_percentage: Math.round(overallPercentage * 10) / 10,
      remaining_amount: Math.round((totalTarget - totalCurrent) * 100) / 100
    });
  } catch (error) {
    console.error('Get goals stats error:', error);
    res.json({
      total_goals: 0,
      completed_goals: 0,
      total_target: 0,
      total_current: 0,
      overall_percentage: 0,
      remaining_amount: 0
    });
  }
};

// @desc    Get all savings goals
// @access  Private
export const getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });

    const result = goals.map(goal => {
      const percentage = goal.targetAmount > 0
        ? (goal.currentAmount / goal.targetAmount) * 100
        : 0;

      let daysLeft = null;
      let neededPerDay = 0;

      if (goal.deadline) {
        const now = new Date();
        const deadline = new Date(goal.deadline);
        daysLeft = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));

        if (daysLeft > 0 && goal.currentAmount < goal.targetAmount) {
          neededPerDay = (goal.targetAmount - goal.currentAmount) / daysLeft;
        }
      }

      return {
        id: goal._id,
        name: goal.name,
        target: goal.targetAmount,
        current: goal.currentAmount,
        percentage: Math.round(percentage * 10) / 10,
        daysLeft,
        neededPerDay: Math.round(neededPerDay * 100) / 100,
        deadline: goal.deadline
      };
    });

    res.json({ goals: result });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

// @desc    Update goal progress
// @access  Private
export const updateGoal = async (req, res) => {
  try {
    const { currentAmount } = req.body;

    if (currentAmount === undefined || currentAmount < 0) {
      return res.status(400).json({ error: 'Valid current amount is required' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    goal.currentAmount = parseFloat(currentAmount);
    await goal.save();

    res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

// @desc    Delete goal
// @access  Private
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

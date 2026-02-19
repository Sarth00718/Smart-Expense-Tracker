import BaseRepository from './baseRepository.js';
import Goal from '../models/Goal.js';

class GoalRepository extends BaseRepository {
  constructor() {
    super(Goal);
  }

  async findByUserId(userId, options = {}) {
    return this.find({ userId }, options);
  }

  async findByUserIdAndId(userId, goalId) {
    return this.findOne({ _id: goalId, userId });
  }

  async deleteByUserIdAndId(userId, goalId) {
    return this.model.findOneAndDelete({ _id: goalId, userId });
  }

  async updateProgress(goalId, amount) {
    return this.model.findByIdAndUpdate(
      goalId,
      { $inc: { currentAmount: amount } },
      { new: true, runValidators: true }
    );
  }
}

export default new GoalRepository();

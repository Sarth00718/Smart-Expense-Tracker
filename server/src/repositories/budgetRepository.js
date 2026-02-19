import BaseRepository from './baseRepository.js';
import Budget from '../models/Budget.js';

class BudgetRepository extends BaseRepository {
  constructor() {
    super(Budget);
  }

  async findByUserId(userId) {
    return this.find({ userId });
  }

  async findByUserIdAndCategory(userId, category) {
    return this.findOne({ userId, category });
  }

  async upsertBudget(userId, category, monthlyBudget) {
    return this.model.findOneAndUpdate(
      { userId, category },
      { monthlyBudget },
      { new: true, upsert: true, runValidators: true }
    );
  }

  async deleteByUserIdAndCategory(userId, category) {
    return this.model.findOneAndDelete({ userId, category });
  }
}

export default new BudgetRepository();

import BaseRepository from './baseRepository.js';
import Achievement from '../models/Achievement.js';

class AchievementRepository extends BaseRepository {
  constructor() {
    super(Achievement);
  }

  async findByUserId(userId) {
    return this.find({ userId }, { sort: { earnedAt: -1 } });
  }

  async findByUserIdAndBadge(userId, badgeName) {
    return this.findOne({ userId, badgeName });
  }

  async createIfNotExists(userId, badgeName, badgeType) {
    try {
      return await this.create({ userId, badgeName, badgeType });
    } catch (error) {
      // If duplicate key error (badge already exists), return null
      if (error.code === 11000) {
        return null;
      }
      throw error;
    }
  }

  async countByUserId(userId) {
    return this.count({ userId });
  }
}

export default new AchievementRepository();

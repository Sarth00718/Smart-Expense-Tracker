import BaseRepository from './baseRepository.js';
import SavedFilter from '../models/SavedFilter.js';

class SavedFilterRepository extends BaseRepository {
  constructor() {
    super(SavedFilter);
  }

  async findByUserId(userId) {
    return this.find({ userId }, { sort: { createdAt: -1 } });
  }

  async findByUserIdAndId(userId, filterId) {
    return this.findOne({ _id: filterId, userId });
  }

  async findDefaultFilter(userId) {
    return this.findOne({ userId, isDefault: true });
  }

  async setAsDefault(userId, filterId) {
    // Remove default from all other filters
    await this.model.updateMany(
      { userId, isDefault: true },
      { isDefault: false }
    );
    
    // Set this filter as default
    return this.model.findByIdAndUpdate(
      filterId,
      { isDefault: true },
      { new: true }
    );
  }

  async deleteByUserIdAndId(userId, filterId) {
    return this.model.findOneAndDelete({ _id: filterId, userId });
  }
}

export default new SavedFilterRepository();

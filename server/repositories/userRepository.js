const BaseRepository = require('./baseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.findOne({ email: email.toLowerCase() });
  }

  async findByFirebaseUid(uid) {
    return this.findOne({ firebaseUid: uid });
  }

  async updateLastLogin(userId) {
    return this.model.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true, validateBeforeSave: false }
    );
  }
}

module.exports = new UserRepository();

import BaseRepository from './baseRepository.js';
import ChatHistory from '../models/ChatHistory.js';

class ChatHistoryRepository extends BaseRepository {
  constructor() {
    super(ChatHistory);
  }

  async findByUserId(userId, options = {}) {
    return this.find({ userId, isActive: true }, { 
      sort: { lastMessageAt: -1 },
      ...options 
    });
  }

  async findByConversationId(userId, conversationId) {
    return this.findOne({ userId, conversationId });
  }

  async addMessage(userId, conversationId, message) {
    return this.model.findOneAndUpdate(
      { userId, conversationId },
      { 
        $push: { messages: message },
        $set: { lastMessageAt: message.timestamp }
      },
      { new: true, upsert: true }
    );
  }

  async createConversation(userId, conversationId, title = 'New Conversation') {
    return this.create({
      userId,
      conversationId,
      title,
      messages: [],
      isActive: true
    });
  }

  async deleteConversation(userId, conversationId) {
    return this.model.findOneAndUpdate(
      { userId, conversationId },
      { isActive: false },
      { new: true }
    );
  }
}

export default new ChatHistoryRepository();

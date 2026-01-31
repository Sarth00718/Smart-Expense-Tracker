const mongoose = require('mongoose');

const expenseTemplateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Travel', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Wallet', 'Other'],
    default: 'Cash'
  },
  tags: [{
    type: String,
    trim: true
  }],
  templateCategory: {
    type: String,
    enum: ['Bills', 'Subscriptions', 'Travel', 'Shopping', 'Other'],
    default: 'Other'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
expenseTemplateSchema.index({ userId: 1, name: 1 }, { unique: true });
expenseTemplateSchema.index({ userId: 1, templateCategory: 1 });
expenseTemplateSchema.index({ userId: 1, usageCount: -1 });

// Method to increment usage
expenseTemplateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

module.exports = mongoose.model('ExpenseTemplate', expenseTemplateSchema);

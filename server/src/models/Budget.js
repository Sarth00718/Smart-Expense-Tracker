import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Travel', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other']
  },
  monthlyBudget: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Unique constraint: one budget per category per user
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);

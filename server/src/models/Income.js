import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  source: {
    type: String,
    required: true,
    enum: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Bonus', 'Rental', 'Other'],
    index: true
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
  isRecurring: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ userId: 1, source: 1 });

export default mongoose.model('Income', incomeSchema);

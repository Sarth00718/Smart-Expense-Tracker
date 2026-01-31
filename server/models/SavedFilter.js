const mongoose = require('mongoose');

const savedFilterSchema = new mongoose.Schema({
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
  filters: {
    dateRange: {
      start: Date,
      end: Date
    },
    amountRange: {
      min: Number,
      max: Number
    },
    categories: [{
      type: String
    }],
    paymentModes: [{
      type: String
    }],
    tags: [{
      type: String
    }],
    searchText: String
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
savedFilterSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SavedFilter', savedFilterSchema);

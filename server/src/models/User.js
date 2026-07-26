import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { EXPENSE_CATEGORIES, INCOME_SOURCES } from '../../../client/src/constants/categories.js';

const categorySchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
  emoji: { type: String },
  color: {
    bg: { type: String },
    text: { type: String }
  }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Never include in query results by default
      required: function () {
        return this.authProvider === 'local' || (!this.authProvider && !this.firebaseUid);
      },
    },
    firebaseUid: { type: String },
    authProvider: {
      type: String,
      enum: ['local', 'firebase', 'both'],
      default: 'local',
    },
    fullName: { type: String, trim: true, default: '' },
    picture: { type: String },
    lastLogin: { type: Date, default: Date.now },
    preferences: {
      colorScheme: {
        type: String,
        enum: ['blue', 'green', 'purple', 'orange', 'pink'],
        default: 'blue',
      },
    },
    biometricCredentials: [
      {
        credentialId: String,
        publicKey: String,
        counter: Number,
        createdAt: Date,
      },
    ],
    categories: {
      expense: {
        type: [categorySchema],
        default: () => {
          // Provide defaults if not found (though they should be imported)
          return [
            { value: 'Food', label: '🍔 Food', emoji: '🍔', color: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' } },
            { value: 'Travel', label: '✈️ Travel', emoji: '✈️', color: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' } },
            { value: 'Transport', label: '🚗 Transport', emoji: '🚗', color: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400' } },
            { value: 'Shopping', label: '🛍️ Shopping', emoji: '🛍️', color: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' } },
            { value: 'Bills', label: '📄 Bills', emoji: '📄', color: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' } },
            { value: 'Entertainment', label: '🎬 Entertainment', emoji: '🎬', color: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' } },
            { value: 'Healthcare', label: '🏥 Healthcare', emoji: '🏥', color: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' } },
            { value: 'Education', label: '📚 Education', emoji: '📚', color: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' } },
            { value: 'Other', label: '📦 Other', emoji: '📦', color: { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-600 dark:text-slate-400' } }
          ];
        }
      },
      income: {
        type: [categorySchema],
        default: () => {
          return [
            { value: 'Salary', label: '💼 Salary', emoji: '💼', color: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' } },
            { value: 'Freelance', label: '💻 Freelance', emoji: '💻', color: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' } },
            { value: 'Investment', label: '📈 Investment', emoji: '📈', color: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' } },
            { value: 'Business', label: '🏢 Business', emoji: '🏢', color: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' } },
            { value: 'Gift', label: '🎁 Gift', emoji: '🎁', color: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' } },
            { value: 'Bonus', label: '🎉 Bonus', emoji: '🎉', color: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' } },
            { value: 'Rental', label: '🏠 Rental', emoji: '🏠', color: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' } },
            { value: 'Other', label: '📦 Other', emoji: '📦', color: { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-600 dark:text-slate-400' } }
          ];
        }
      }
    }
  },
  { timestamps: true }
);

userSchema.index({ email: 1, authProvider: 1 });
userSchema.index({ firebaseUid: 1 }, { sparse: true, unique: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);

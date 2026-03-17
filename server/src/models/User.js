import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
      required: function () {
        return this.authProvider === 'local' || (!this.authProvider && !this.firebaseUid);
      },
    },
    firebaseUid: { type: String, sparse: true },
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

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ValidationError, AuthenticationError, ConflictError } from '../utils/errors.js';
import { config } from '../config/env.js';

class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiry });
  }

  validateEmail(email) {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!regex.test(email) || email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      throw new ValidationError('Invalid email format');
    }
  }

  validatePassword(password) {
    if (password.length < 8) throw new ValidationError('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new ValidationError('Password must contain uppercase, lowercase, number, and special character');
    }
  }

  async register(email, password, fullName) {
    if (!email || !password) throw new ValidationError('Email and password are required');
    if (!fullName || fullName.trim() === '') throw new ValidationError('Full name is required');

    this.validateEmail(email);
    this.validatePassword(password);

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new ConflictError('User already exists with this email');

    const user = await User.create({ email: email.toLowerCase(), password, fullName: fullName.trim() });
    const token = this.generateToken(user._id);
    return { token, user: this.sanitizeUser(user) };
  }

  async login(email, password) {
    if (!email || !password) throw new ValidationError('Email and password are required');

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) throw new AuthenticationError('Invalid credentials');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AuthenticationError('Invalid credentials');

    // Update lastLogin in background — don't await to save a round-trip
    User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).exec().catch(() => {});

    const token = this.generateToken(user._id);
    return { token, user: this.sanitizeUser(user) };
  }

  async syncFirebaseUser(uid, email, fullName, picture) {
    if (!uid || !email) throw new ValidationError('Firebase UID and email are required');

    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      if (picture && !user.picture) { user.picture = picture; await user.save({ validateBeforeSave: false }); }
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      return { token: this.generateToken(user._id), user: this.sanitizeUser(user), message: 'Firebase user synced successfully' };
    }

    user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      user.firebaseUid = uid;
      user.authProvider = 'both';
      if (picture && !user.picture) user.picture = picture;
      await user.save({ validateBeforeSave: false });
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      return { token: this.generateToken(user._id), user: this.sanitizeUser(user), message: 'Existing user linked to Firebase' };
    }

    user = await User.create({
      email: email.toLowerCase(),
      fullName: fullName || email.split('@')[0],
      firebaseUid: uid,
      authProvider: 'firebase',
      picture,
    });
    return { token: this.generateToken(user._id), user: this.sanitizeUser(user), message: 'New Firebase user created' };
  }

  async linkFirebaseToUser(userId, firebaseUid) {
    if (!firebaseUid) throw new ValidationError('Firebase UID is required');

    const existing = await User.findOne({ firebaseUid });
    if (existing && existing._id.toString() !== userId.toString()) {
      throw new ConflictError('Firebase account already linked to another user');
    }

    const user = await User.findById(userId);
    user.firebaseUid = firebaseUid;
    user.authProvider = 'both';
    await user.save({ validateBeforeSave: false });
    return { user: this.sanitizeUser(user), message: 'Firebase account linked successfully' };
  }

  sanitizeUser(user) {
    return {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      picture: user.picture,
      createdAt: user.createdAt,
      authProvider: user.authProvider,
    };
  }
}

export default new AuthService();

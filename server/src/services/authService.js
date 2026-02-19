import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';
import { ValidationError, AuthenticationError, ConflictError } from '../utils/errors.js';
import { config } from '../config/env.js';

class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiry });
  }

  validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      throw new ValidationError('Invalid email format');
    }
  }

  validatePassword(password) {
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new ValidationError(
        'Password must contain uppercase, lowercase, number, and special character'
      );
    }
  }

  async register(email, password, fullName) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    if (!fullName || fullName.trim() === '') {
      throw new ValidationError('Full name is required');
    }

    this.validateEmail(email);
    this.validatePassword(password);

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User already exists with this email');
    }

    const user = await userRepository.create({
      email: email.toLowerCase(),
      password,
      fullName: fullName.trim()
    });

    const token = this.generateToken(user._id);

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }

    await userRepository.updateLastLogin(user._id);

    const token = this.generateToken(user._id);

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  async syncFirebaseUser(uid, email, fullName, picture) {
    if (!uid || !email) {
      throw new ValidationError('Firebase UID and email are required');
    }

    let user = await userRepository.findByFirebaseUid(uid);

    if (user) {
      if (picture && !user.picture) {
        user.picture = picture;
        await user.save({ validateBeforeSave: false });
      }
      await userRepository.updateLastLogin(user._id);

      const token = this.generateToken(user._id);
      return {
        token,
        user: this.sanitizeUser(user),
        message: 'Firebase user synced successfully'
      };
    }

    user = await userRepository.findByEmail(email);

    if (user) {
      user.firebaseUid = uid;
      user.authProvider = 'both';
      if (picture && !user.picture) {
        user.picture = picture;
      }
      await user.save({ validateBeforeSave: false });
      await userRepository.updateLastLogin(user._id);

      const token = this.generateToken(user._id);
      return {
        token,
        user: this.sanitizeUser(user),
        message: 'Existing user linked to Firebase successfully'
      };
    }

    user = await userRepository.create({
      email: email.toLowerCase(),
      fullName: fullName || email.split('@')[0],
      firebaseUid: uid,
      authProvider: 'firebase',
      picture
    });

    const token = this.generateToken(user._id);
    return {
      token,
      user: this.sanitizeUser(user),
      message: 'New Firebase user created successfully'
    };
  }

  async linkFirebaseToUser(userId, firebaseUid) {
    if (!firebaseUid) {
      throw new ValidationError('Firebase UID is required');
    }

    const existingUser = await userRepository.findByFirebaseUid(firebaseUid);
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      throw new ConflictError('Firebase account already linked to another user');
    }

    const user = await userRepository.findById(userId);
    user.firebaseUid = firebaseUid;
    user.authProvider = 'both';
    await user.save({ validateBeforeSave: false });

    return {
      user: this.sanitizeUser(user),
      message: 'Firebase account linked successfully'
    };
  }

  sanitizeUser(user) {
    return {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      picture: user.picture,
      createdAt: user.createdAt,
      authProvider: user.authProvider
    };
  }
}

export default new AuthService();

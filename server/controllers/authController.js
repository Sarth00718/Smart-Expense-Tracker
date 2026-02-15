const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Register new user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({ error: 'Full name is required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      fullName: fullName.trim()
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Register error:', error);

    if (error.code === 11000) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
};

// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        picture: user.picture,
        createdAt: user.createdAt,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// @desc    Get current user
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        picture: req.user.picture,
        createdAt: req.user.createdAt,
        authProvider: req.user.authProvider
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Sync Firebase user with MongoDB
// @access  Public
exports.firebaseSync = async (req, res) => {
  try {
    const { uid, email, fullName, picture } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: 'Firebase UID and email are required' });
    }

    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      user.lastLogin = new Date();
      if (picture && !user.picture) {
        user.picture = picture;
      }
      await user.save({ validateBeforeSave: false });

      const token = generateToken(user._id);
      return res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          picture: user.picture,
          createdAt: user.createdAt,
          authProvider: user.authProvider
        },
        message: 'Firebase user synced successfully'
      });
    }

    user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      user.firebaseUid = uid;
      user.authProvider = 'both';
      user.lastLogin = new Date();
      if (picture && !user.picture) {
        user.picture = picture;
      }
      await user.save({ validateBeforeSave: false });

      const token = generateToken(user._id);
      return res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          picture: user.picture,
          createdAt: user.createdAt,
          authProvider: user.authProvider
        },
        message: 'Existing user linked to Firebase successfully'
      });
    }

    user = new User({
      email: email.toLowerCase(),
      fullName: fullName || email.split('@')[0],
      firebaseUid: uid,
      authProvider: 'firebase',
      picture: picture
    });

    await user.save();

    const token = generateToken(user._id);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        picture: user.picture,
        createdAt: user.createdAt,
        authProvider: user.authProvider
      },
      message: 'New Firebase user created successfully'
    });
  } catch (error) {
    console.error('Firebase sync error:', error);

    if (error.code === 11000) {
      return res.status(400).json({ error: 'User sync failed: duplicate entry' });
    }

    res.status(500).json({ error: 'Server error during Firebase sync' });
  }
};

// @desc    Link Firebase UID to existing logged-in user
// @access  Private
exports.linkFirebase = async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'Firebase UID is required' });
    }

    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ error: 'Firebase account already linked to another user' });
    }

    req.user.firebaseUid = firebaseUid;
    req.user.authProvider = 'both';
    await req.user.save({ validateBeforeSave: false });

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        picture: req.user.picture,
        createdAt: req.user.createdAt,
        authProvider: req.user.authProvider
      },
      message: 'Firebase account linked successfully'
    });
  } catch (error) {
    console.error('Link Firebase error:', error);
    res.status(500).json({ error: 'Server error during Firebase linking' });
  }
};

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({ error: 'Full name is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      fullName: fullName.trim()
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        picture: req.user.picture
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/firebase-sync
// @desc    Sync Firebase user with MongoDB (link or create)
// @access  Public
router.post('/firebase-sync', async (req, res) => {
  try {
    const { uid, email, fullName, picture } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: 'Firebase UID and email are required' });
    }

    // Check if user exists by Firebase UID
    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      // User already linked, update last login
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
          picture: user.picture
        },
        message: 'Firebase user synced successfully'
      });
    }

    // Check if user exists by email (existing MongoDB user)
    user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Link existing MongoDB user to Firebase
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
          picture: user.picture
        },
        message: 'Existing user linked to Firebase successfully'
      });
    }

    // Create new user for Firebase
    user = new User({
      email: email.toLowerCase(),
      fullName: fullName || email.split('@')[0],
      firebaseUid: uid,
      authProvider: 'firebase',
      picture: picture,
      password: Math.random().toString(36).slice(-12) // Random password (won't be used)
    });

    await user.save();

    const token = generateToken(user._id);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        picture: user.picture
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
});

// @route   POST /api/auth/link-firebase
// @desc    Link Firebase UID to existing logged-in user
// @access  Private
router.post('/link-firebase', auth, async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'Firebase UID is required' });
    }

    // Check if Firebase UID is already used by another user
    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ error: 'Firebase account already linked to another user' });
    }

    // Link Firebase to current user
    req.user.firebaseUid = firebaseUid;
    req.user.authProvider = 'both';
    await req.user.save({ validateBeforeSave: false });

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        picture: req.user.picture
      },
      message: 'Firebase account linked successfully'
    });
  } catch (error) {
    console.error('Link Firebase error:', error);
    res.status(500).json({ error: 'Server error during Firebase linking' });
  }
});

module.exports = router;

import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, authController.getMe);

// @route   POST /api/auth/firebase-sync
// @desc    Sync Firebase user with MongoDB (link or create)
// @access  Public
router.post('/firebase-sync', authController.firebaseSync);

// @route   POST /api/auth/link-firebase
// @desc    Link Firebase UID to existing logged-in user
// @access  Private
router.post('/link-firebase', auth, authController.linkFirebase);

export default router;

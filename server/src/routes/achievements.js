import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import * as achievementController from '../controllers/achievementController.js';

// @route   GET /api/achievements
// @desc    Get user achievements
// @access  Private
router.get('/', auth, achievementController.getAchievements);

export default router;

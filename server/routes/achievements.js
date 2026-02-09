const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const achievementController = require('../controllers/achievementController');

// @route   GET /api/achievements
// @desc    Get user achievements
// @access  Private
router.get('/', auth, achievementController.getAchievements);

module.exports = router;

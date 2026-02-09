const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validateObjectId');
const goalController = require('../controllers/goalController');

// @route   POST /api/goals
// @desc    Add savings goal
// @access  Private
router.post('/', auth, goalController.createGoal);

// @route   GET /api/goals/stats
// @desc    Get goals statistics
// @access  Private
// IMPORTANT: This route MUST come before /:id routes
router.get('/stats', auth, goalController.getStats);

// @route   GET /api/goals
// @desc    Get all savings goals
// @access  Private
router.get('/', auth, goalController.getAllGoals);

// @route   PUT /api/goals/:id
// @desc    Update goal progress
// @access  Private
router.put('/:id', auth, validateObjectId(), goalController.updateGoal);

// @route   DELETE /api/goals/:id
// @desc    Delete goal
// @access  Private
router.delete('/:id', auth, validateObjectId(), goalController.deleteGoal);

module.exports = router;

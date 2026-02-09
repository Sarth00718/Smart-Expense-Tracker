const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const budgetController = require('../controllers/budgetController');

// @route   POST /api/budgets
// @desc    Set budget for category
// @access  Private
router.post('/', auth, budgetController.createBudget);

// @route   GET /api/budgets
// @desc    Get all budgets with spending analysis
// @access  Private
router.get('/', auth, budgetController.getAllBudgets);

// @route   DELETE /api/budgets/:category
// @desc    Delete budget
// @access  Private
router.delete('/:category', auth, budgetController.deleteBudget);

module.exports = router;

import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import * as budgetController from '../controllers/budgetController.js';

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

export default router;

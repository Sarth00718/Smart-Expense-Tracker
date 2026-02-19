import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import * as expenseController from '../controllers/expenseController.js';

// IMPORTANT: Specific routes MUST come before parameterized routes like /:id
// Otherwise Express will match "filter" as an ID parameter

// @route   GET /api/expenses/filter
// @desc    Filter expenses
// @access  Private
router.get('/filter', auth, expenseController.filterExpenses);

// @route   GET /api/expenses/categories
// @desc    Get unique categories
// @access  Private
router.get('/categories', auth, expenseController.getCategories);

// @route   GET /api/expenses/summary
// @desc    Get expense summary statistics
// @access  Private
router.get('/summary', auth, expenseController.getSummary);

// @route   GET /api/expenses/total
// @desc    Get total of all expenses
// @access  Private
router.get('/total', auth, expenseController.getTotal);

// @route   GET /api/expenses/category-summary
// @desc    Get summary by category
// @access  Private
router.get('/category-summary', auth, expenseController.getCategorySummary);

// @route   GET /api/expenses/recent/:limit
// @desc    Get recent expenses with limit
// @access  Private
router.get('/recent/:limit', auth, expenseController.getRecentExpenses);

// @route   POST /api/expenses/search
// @desc    Natural language search
// @access  Private
router.post('/search', auth, expenseController.searchExpenses);

// @route   POST /api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', auth, expenseController.createExpense);

// @route   GET /api/expenses
// @desc    Get all expenses for user with pagination
// @access  Private
router.get('/', auth, expenseController.getAllExpenses);

// @route   DELETE /api/expenses
// @desc    Delete all expenses for user (DANGEROUS - requires confirmation)
// @access  Private
router.delete('/', auth, expenseController.deleteAllExpenses);

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', auth, validateObjectId(), expenseController.updateExpense);

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', auth, validateObjectId(), expenseController.deleteExpense);

export default router;

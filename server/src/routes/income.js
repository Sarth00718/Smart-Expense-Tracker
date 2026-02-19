import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import * as incomeController from '../controllers/incomeController.js';

// @route   GET /api/income/sources
// @desc    Get unique income sources
// @access  Private
router.get('/sources', auth, incomeController.getSources);

// @route   GET /api/income
// @desc    Get all income with pagination
// @access  Private
router.get('/', auth, incomeController.getAllIncome);

// @route   POST /api/income
// @desc    Add new income
// @access  Private
router.post('/', auth, incomeController.createIncome);

// @route   PUT /api/income/:id
// @desc    Update income
// @access  Private
router.put('/:id', auth, validateObjectId(), incomeController.updateIncome);

// @route   GET /api/income/summary
// @desc    Get income summary statistics
// @access  Private
// IMPORTANT: This route MUST come before /:id routes
router.get('/summary', auth, incomeController.getSummary);

// @route   DELETE /api/income/:id
// @desc    Delete income
// @access  Private
router.delete('/:id', auth, validateObjectId(), incomeController.deleteIncome);

export default router;

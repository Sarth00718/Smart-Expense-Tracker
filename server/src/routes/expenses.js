import express from 'express';
import auth from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import * as expenseController from '../controllers/expenseController.js';

const router = express.Router();

router.use(apiLimiter);

// Specific routes MUST come before /:id
router.get('/filter', auth, expenseController.filterExpenses);
router.get('/categories', auth, expenseController.getCategories);
router.get('/summary', auth, expenseController.getSummary);
router.get('/recent/:limit', auth, expenseController.getRecentExpenses);
router.post('/search', auth, expenseController.searchExpenses);

router.get('/', auth, expenseController.getAllExpenses);
router.post('/', auth, expenseController.createExpense);
router.delete('/', auth, expenseController.deleteAllExpenses);
router.put('/:id', auth, validateObjectId(), expenseController.updateExpense);
router.delete('/:id', auth, validateObjectId(), expenseController.deleteExpense);

export default router;

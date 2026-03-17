import express from 'express';
import auth from '../middleware/auth.js';
import * as budgetController from '../controllers/budgetController.js';

const router = express.Router();

router.get('/', auth, budgetController.getAllBudgets);
router.post('/', auth, budgetController.createBudget);
router.delete('/:category', auth, budgetController.deleteBudget);

export default router;

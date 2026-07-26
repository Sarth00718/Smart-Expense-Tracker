import express from 'express';
import auth from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import * as budgetController from '../controllers/budgetController.js';

const router = express.Router();

router.use(apiLimiter);

router.get('/', auth, budgetController.getAllBudgets);
router.post('/', auth, budgetController.createBudget);
router.delete('/:category', auth, budgetController.deleteBudget);

export default router;

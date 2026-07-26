import express from 'express';
import auth from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import * as incomeController from '../controllers/incomeController.js';

const router = express.Router();

router.use(apiLimiter);

// Specific routes MUST come before /:id
router.get('/sources', auth, incomeController.getSources);
router.get('/summary', auth, incomeController.getSummary);

router.get('/', auth, incomeController.getAllIncome);
router.post('/', auth, incomeController.createIncome);
router.put('/:id', auth, validateObjectId(), incomeController.updateIncome);
router.delete('/:id', auth, validateObjectId(), incomeController.deleteIncome);

export default router;

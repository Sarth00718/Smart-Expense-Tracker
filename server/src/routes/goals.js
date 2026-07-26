import express from 'express';
import auth from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import * as goalController from '../controllers/goalController.js';

const router = express.Router();

router.use(apiLimiter);

// Specific routes MUST come before /:id
router.get('/stats', auth, goalController.getStats);

router.get('/', auth, goalController.getAllGoals);
router.post('/', auth, goalController.createGoal);
router.put('/:id', auth, validateObjectId(), goalController.updateGoal);
router.delete('/:id', auth, validateObjectId(), goalController.deleteGoal);

export default router;

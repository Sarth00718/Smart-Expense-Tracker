import express from 'express';
import auth from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import * as goalController from '../controllers/goalController.js';

const router = express.Router();

// Specific routes MUST come before /:id
router.get('/stats', auth, goalController.getStats);

router.get('/', auth, goalController.getAllGoals);
router.post('/', auth, goalController.createGoal);
router.put('/:id', auth, validateObjectId(), goalController.updateGoal);
router.delete('/:id', auth, validateObjectId(), goalController.deleteGoal);

export default router;

import express from 'express';
import auth from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import * as achievementController from '../controllers/achievementController.js';

const router = express.Router();

router.use(apiLimiter);

router.get('/', auth, achievementController.getAchievements);

export default router;

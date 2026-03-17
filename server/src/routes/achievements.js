import express from 'express';
import auth from '../middleware/auth.js';
import * as achievementController from '../controllers/achievementController.js';

const router = express.Router();

router.get('/', auth, achievementController.getAchievements);

export default router;

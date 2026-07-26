import express from 'express';
import auth from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

router.use(apiLimiter);

router.get('/dashboard', auth, analyticsController.getDashboard);
router.get('/heatmap', auth, analyticsController.getHeatmap);
router.get('/patterns', auth, analyticsController.getPatterns);
router.get('/predictions', auth, analyticsController.getPredictions);
router.get('/score', auth, analyticsController.getScore);

export default router;

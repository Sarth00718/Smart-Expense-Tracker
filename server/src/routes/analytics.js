import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import * as analyticsController from '../controllers/analyticsController.js';

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard statistics (includes income + expenses)
// @access  Private
router.get('/dashboard', auth, analyticsController.getDashboard);

// @route   GET /api/analytics/heatmap
// @desc    Get calendar heatmap data
// @access  Private
router.get('/heatmap', auth, analyticsController.getHeatmap);

// @route   GET /api/analytics/patterns
// @desc    Detect behavioral patterns
// @access  Private
router.get('/patterns', auth, analyticsController.getPatterns);

// @route   GET /api/analytics/predictions
// @desc    Predict future expenses
// @access  Private
router.get('/predictions', auth, analyticsController.getPredictions);

// @route   GET /api/analytics/score
// @desc    Calculate spending score
// @access  Private
router.get('/score', auth, analyticsController.getScore);

export default router;

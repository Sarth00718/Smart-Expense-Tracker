const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');

// @route   GET /api/health
// @desc    Comprehensive health check
// @access  Public
router.get('/', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      backend: { status: 'up', message: 'Backend server is running' },
      database: { status: 'unknown', message: '' },
      ai: { status: 'unknown', message: '' }
    }
  };

  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      health.services.database.status = 'up';
      health.services.database.message = 'MongoDB connected';
    } else {
      health.services.database.status = 'down';
      health.services.database.message = 'MongoDB disconnected';
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.database.status = 'down';
    health.services.database.message = error.message;
    health.status = 'degraded';
  }

  // Check AI service (OpenAI/Gemini)
  try {
    const aiProvider = process.env.AI_PROVIDER || 'openai';
    
    if (aiProvider === 'openai' && process.env.OPENAI_API_KEY) {
      health.services.ai.status = 'configured';
      health.services.ai.message = 'OpenAI API key configured';
    } else if (aiProvider === 'gemini' && process.env.GEMINI_API_KEY) {
      health.services.ai.status = 'configured';
      health.services.ai.message = 'Gemini API key configured';
    } else {
      health.services.ai.status = 'not_configured';
      health.services.ai.message = 'AI service not configured';
    }
  } catch (error) {
    health.services.ai.status = 'error';
    health.services.ai.message = error.message;
  }

  // Set overall status
  const allUp = Object.values(health.services).every(s => s.status === 'up' || s.status === 'configured');
  if (!allUp && health.status === 'healthy') {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;

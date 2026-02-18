const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (_req, res) => {
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
      // Ping database to ensure it's responsive
      await mongoose.connection.db.admin().ping();
      health.services.database.status = 'up';
      health.services.database.message = 'MongoDB connected and responsive';
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

  // Check AI service (Groq)
  try {
    if (process.env.GROQ_API_KEY) {
      health.services.ai.status = 'configured';
      health.services.ai.message = 'Groq API key configured';
    } else {
      health.services.ai.status = 'not_configured';
      health.services.ai.message = 'AI service not configured (Groq API key missing)';
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

// Lightweight ping endpoint for keep-alive
router.get('/ping', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;

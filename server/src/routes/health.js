import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (_req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      backend: { status: 'up', message: 'Backend server is running' },
      database: { status: 'unknown', message: '' },
    },
  };

  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      health.services.database = { status: 'up', message: 'MongoDB connected and responsive' };
    } else {
      health.services.database = { status: 'down', message: 'MongoDB disconnected' };
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.database = { status: 'down', message: error.message };
    health.status = 'degraded';
  }

  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// Lightweight ping for keep-alive
router.get('/ping', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

export default router;

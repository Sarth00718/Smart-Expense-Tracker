import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { validateEnv, config } from './config/env.js';
import database from './config/database.js';
import { securityHeaders, sanitizeInput } from './middleware/security.js';
import { authLimiter, aiLimiter, apiLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import incomeRoutes from './routes/income.js';
import budgetRoutes from './routes/budgets.js';
import goalRoutes from './routes/goals.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';
import achievementRoutes from './routes/achievements.js';
import receiptRoutes from './routes/receipts.js';
import budgetRecommendationsRoutes from './routes/budgetRecommendations.js';
import healthRoutes from './routes/health.js';
import reportsRoutes from './routes/reports.js';
import voiceRoutes from './routes/voice.js';
import filtersRoutes from './routes/filters.js';
import usersRoutes from './routes/users.js';
import exportRoutes from './routes/export.js';
import biometricRoutes from './routes/biometric.js';

// Validate environment variables
validateEnv();

const app = express();

// Security headers
app.use(securityHeaders);

// Compression
app.use(compression());

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow localhost during development
    if (
      origin.startsWith('http://localhost') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input sanitization
app.use(sanitizeInput);

// Connect to database
await database.connect();

// API Routes with smart rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/health', healthRoutes); // No rate limit for health checks
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/budget-recommendations', budgetRecommendationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/filters', filtersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/biometric', authLimiter, biometricRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Smart Expense Tracker API - Production Ready MERN Stack',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: 'See README.md for API documentation'
    }
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: database.getConnection() ? 'connected' : 'disconnected'
  });
});

// 404 handler - must be before error handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server gracefully...');
  await database.disconnect();
  process.exit(0);
});

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

export default app;

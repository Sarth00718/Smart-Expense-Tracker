import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { validateEnv, config } from './config/env.js';
import database from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Routes
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

// Validate required environment variables
validateEnv();

const app = express();

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (config.allowedOrigins.includes(origin)) return callback(null, true);
      if (origin.startsWith('http://localhost') || origin.endsWith('.vercel.app')) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── Database Connection ───────────────────────────────────────────────────────
await database.connect();

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);                          // No rate limit — monitoring
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/budget-recommendations', budgetRecommendationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/filters', filtersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/export', exportRoutes);

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: 'Smart Expense Tracker API',
    version: '2.0.0',
    status: 'running',
    docs: 'See README.md for API documentation',
  });
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: database.isConnected() ? 'connected' : 'disconnected',
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  await database.disconnect();
  process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
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

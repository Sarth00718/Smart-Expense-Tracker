const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  process.exit(1);
}

// Import routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const incomeRoutes = require('./routes/income');
const budgetRoutes = require('./routes/budgets');
const goalRoutes = require('./routes/goals');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const achievementRoutes = require('./routes/achievements');
const receiptRoutes = require('./routes/receipts');
const budgetRecommendationsRoutes = require('./routes/budgetRecommendations');
const healthRoutes = require('./routes/health');
const reportsRoutes = require('./routes/reports');
const voiceRoutes = require('./routes/voice');
const filtersRoutes = require('./routes/filters');
const usersRoutes = require('./routes/users');
const exportRoutes = require('./routes/export');
const biometricRoutes = require('./routes/biometric');

// Import rate limiters
const { authLimiter, aiLimiter, apiLimiter } = require('./middleware/rateLimiter');

// Import security middleware
const { securityHeaders, sanitizeInput } = require('./middleware/security');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(securityHeaders);

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:4174',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (origin.endsWith('.vercel.app') ||
      origin.endsWith('.render.com') ||
      origin === 'http://localhost' ||
      origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input sanitization
app.use(sanitizeInput);

// MongoDB Connection with proper options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true,
})
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('MongoDB Connected');
    }
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('MongoDB disconnected. Reconnecting...');
  }
});

mongoose.connection.on('reconnected', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('MongoDB Reconnected');
  }
});

// Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/expenses', apiLimiter, expenseRoutes);
app.use('/api/income', apiLimiter, incomeRoutes);
app.use('/api/budgets', apiLimiter, budgetRoutes);
app.use('/api/goals', apiLimiter, goalRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/achievements', apiLimiter, achievementRoutes);
app.use('/api/receipts', apiLimiter, receiptRoutes);
app.use('/api/budget-recommendations', apiLimiter, budgetRecommendationsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/reports', apiLimiter, reportsRoutes);
app.use('/api/voice', apiLimiter, voiceRoutes);
app.use('/api/filters', apiLimiter, filtersRoutes);
app.use('/api/users', apiLimiter, usersRoutes);
app.use('/api/export', apiLimiter, exportRoutes);
app.use('/api/biometric', authLimiter, biometricRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Smart Expense Tracker API - MERN Stack',
    version: '1.0.0',
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
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 handler - must be before error handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  mongoose.connection.close(false, () => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  mongoose.connection.close(false, () => {
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

module.exports = app;

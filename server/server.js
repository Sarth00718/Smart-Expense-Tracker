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
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file');
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

// Import rate limiters
const { authLimiter, aiLimiter, apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173', // Vite preview
  'http://localhost:4174', // Vite preview alternate
  process.env.CLIENT_URL,
  'https://smart-expense-tracker-37ahuzung-sarths-projects-b8db4f8c.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, PWA, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed or matches Vercel pattern
    if (allowedOrigins.includes(origin) || 
        origin.includes('vercel.app') || 
        origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

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
app.use('/api/budget-recommendations', aiLimiter, budgetRecommendationsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/reports', apiLimiter, reportsRoutes);
app.use('/api/voice', apiLimiter, voiceRoutes);
app.use('/api/filters', apiLimiter, filtersRoutes);
app.use('/api/users', apiLimiter, usersRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Expense Tracker API - MERN Stack',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

const rateLimit = require('express-rate-limit');

// Auth routes: strict limits for security
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 10, // Strict in production
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => {
    // Only skip if explicitly set to 'development'
    return process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true';
  }
});

// AI routes: moderate limits (chatbot, recommendations)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 30 : 20, // Stricter in production
  message: {
    error: 'Too many AI requests. Please slow down and try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true';
  }
});

// General API routes: generous limits
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 200 : 100, // Stricter in production
  message: {
    error: 'Too many requests. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true';
  }
});

module.exports = {
  authLimiter,
  aiLimiter,
  apiLimiter
};

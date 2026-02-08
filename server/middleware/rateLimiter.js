const rateLimit = require('express-rate-limit');

// Auth routes: more lenient limits for development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased from 10 to 50 requests per window
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => {
    // Only skip in explicit development mode
    // If NODE_ENV is not set, rate limiting will be enabled (safer default)
    return process.env.NODE_ENV === 'development';
  }
});

// AI routes: moderate limits (chatbot, recommendations)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Increased from 20 to 30 requests per minute
  message: {
    error: 'Too many AI requests. Please slow down and try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development'
  }
});

// General API routes: generous limits
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Increased from 100 to 200 requests per minute
  message: {
    error: 'Too many requests. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development'
  }
});

module.exports = {
  authLimiter,
  aiLimiter,
  apiLimiter
};

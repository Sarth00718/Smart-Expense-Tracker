import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

// Auth routes: strict limits for security
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'development' ? 50 : 10, // Strict in production
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => {
    // Only skip if explicitly set to 'development'
    return config.nodeEnv === 'development' && process.env.DISABLE_RATE_LIMIT === 'true';
  }
});

// AI routes: moderate limits (chatbot, recommendations)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.nodeEnv === 'development' ? 30 : 20, // Stricter in production
  message: {
    error: 'Too many AI requests. Please slow down and try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return config.nodeEnv === 'development' && process.env.DISABLE_RATE_LIMIT === 'true';
  }
});

// General API routes: generous limits
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.nodeEnv === 'development' ? 200 : 100, // Stricter in production
  message: {
    error: 'Too many requests. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return config.nodeEnv === 'development' && process.env.DISABLE_RATE_LIMIT === 'true';
  }
});

import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

// Auth routes: moderate limits for security (increased for better UX)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'development' ? 100 : 30, // More generous in production
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: () => {
    // Disable in development
    return config.nodeEnv === 'development';
  }
});

// AI routes: moderate limits (chatbot, recommendations)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.nodeEnv === 'development' ? 100 : 50, // More generous
  message: {
    error: 'Too many AI requests. Please slow down and try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => {
    return config.nodeEnv === 'development';
  }
});

// General API routes: very generous limits for normal usage
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.nodeEnv === 'development' ? 1000 : 500, // Much more generous
  message: {
    error: 'Too many requests. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => {
    return config.nodeEnv === 'development';
  }
});

// Read-only routes: extremely generous (for GET requests)
export const readLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.nodeEnv === 'development' ? 2000 : 1000, // Very generous for reads
  message: {
    error: 'Too many requests. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => {
    return config.nodeEnv === 'development';
  }
});

// Write routes: moderate limits (for POST/PUT/DELETE)
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.nodeEnv === 'development' ? 500 : 200, // Generous for writes
  message: {
    error: 'Too many write requests. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => {
    return config.nodeEnv === 'development';
  }
});

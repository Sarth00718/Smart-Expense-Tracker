import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

const isDev = config.nodeEnv === 'development';

// Auth routes limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 30,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => isDev,
});

// AI routes limiter
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 100 : 50,
  message: { error: 'Too many AI requests. Please slow down and try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
});

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 1000 : 500,
  message: { error: 'Too many requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
});

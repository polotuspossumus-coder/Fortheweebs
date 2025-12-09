/**
 * Rate Limiter Middleware
 * Prevents abuse of API endpoints
 */

const rateLimit = require('express-rate-limit');

/**
 * Authentication endpoint limiter
 * Strict limits to prevent brute force
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: 'Too many authentication attempts',
    code: 'RATE_LIMIT_AUTH',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Upload endpoint limiter
 * Moderate limits for file uploads
 */
const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    error: 'Upload limit exceeded',
    code: 'RATE_LIMIT_UPLOAD',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI endpoint limiter
 * Conservative limits for expensive AI operations
 */
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 AI requests per hour
  message: {
    error: 'AI request limit exceeded',
    code: 'RATE_LIMIT_AI',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Payment endpoint limiter
 * Very strict to prevent payment abuse
 */
const paymentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: {
    error: 'Payment request limit exceeded',
    code: 'RATE_LIMIT_PAYMENT',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Governance endpoint limiter
 * Strict limits for policy changes
 */
const governanceRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 governance actions per hour
  message: {
    error: 'Governance action limit exceeded',
    code: 'RATE_LIMIT_GOVERNANCE',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Read endpoint limiter
 * Generous limits for read-only operations
 */
const readRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 reads per window
  message: {
    error: 'Too many read requests',
    code: 'RATE_LIMIT_READ',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authRateLimiter,
  apiRateLimiter,
  uploadRateLimiter,
  aiRateLimiter,
  paymentRateLimiter,
  governanceRateLimiter,
  readRateLimiter
};

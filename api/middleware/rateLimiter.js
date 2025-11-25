/**
 * Rate Limiter Middleware
 * Prevents brute force and abuse of governance endpoints
 */

const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for governance overrides
 * Only allows 10 requests per minute per IP
 */
const governanceRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: 'Too many governance requests',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn('⚠️ Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      user: req.user?.email || 'anonymous',
    });

    res.status(429).json({
      error: 'Too many governance requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 60,
    });
  },
});

/**
 * Moderate rate limiter for read operations
 * Allows 60 requests per minute per IP
 */
const readRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    error: 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authentication rate limiter
 * Prevents brute force login attempts
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: 900,
  },
  skipSuccessfulRequests: true,
});

module.exports = {
  governanceRateLimiter,
  readRateLimiter,
  authRateLimiter,
};

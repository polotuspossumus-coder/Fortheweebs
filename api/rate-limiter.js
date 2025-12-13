/**
 * TIER-BASED API RATE LIMITING
 * Middleware to enforce rate limits based on user subscription tier
 */

// Rate limit storage (in-memory, consider Redis for production scale)
const rateLimitStore = new Map();

// Rate limits per tier (requests per minute)
const RATE_LIMITS = {
  'OWNER': Infinity,           // No limits for owner
  'LIFETIME_VIP': 1000,        // 1000 req/min
  'ELITE': 500,                // 500 req/min ($150/mo)
  'VIP': 300,                  // 300 req/min ($100/mo)
  'PREMIUM': 150,              // 150 req/min ($50/mo)
  'ENHANCED': 100,             // 100 req/min ($30/mo)
  'STANDARD': 60,              // 60 req/min ($20/mo)
  'FREE': 30                   // 30 req/min (free tier)
};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < fiveMinutesAgo) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get user's tier from request
 */
function getUserTier(req) {
  // Check multiple sources for tier
  const tier =
    req.headers['x-user-tier'] ||
    req.body?.userTier ||
    req.query?.userTier ||
    'FREE';

  return tier.toUpperCase();
}

/**
 * Get user identifier for rate limiting
 */
function getUserId(req) {
  return (
    req.headers['x-user-id'] ||
    req.headers['x-user-email'] ||
    req.body?.userId ||
    req.body?.userEmail ||
    req.ip ||
    'anonymous'
  );
}

/**
 * Check if user is owner (no rate limits)
 */
function isOwner(email) {
  const OWNER_EMAIL = 'polotuspossumus@gmail.com';
  if (!email) return false;
  return email.toLowerCase().trim() === OWNER_EMAIL.toLowerCase();
}

/**
 * Rate limiting middleware
 */
export function rateLimitByTier(req, res, next) {
  const userId = getUserId(req);
  const userEmail = req.headers['x-user-email'] || req.body?.userEmail;
  const userTier = getUserTier(req);

  // Owner bypasses all rate limits
  if (isOwner(userEmail)) {
    return next();
  }

  // Get rate limit for this tier
  const limit = RATE_LIMITS[userTier] || RATE_LIMITS.FREE;

  // Create unique key for this user
  const key = `${userId}:${req.path}`;
  const now = Date.now();
  const windowStart = now - 60 * 1000; // 1 minute window

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);

  if (!entry) {
    // First request - create new entry
    entry = {
      count: 1,
      resetTime: now + 60 * 1000,
      requests: [now]
    };
    rateLimitStore.set(key, entry);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - 1);
    res.setHeader('X-RateLimit-Reset', entry.resetTime);

    return next();
  }

  // Filter out requests outside the current window
  entry.requests = entry.requests.filter(time => time > windowStart);
  entry.count = entry.requests.length;

  // Check if user exceeded rate limit
  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.setHeader('X-RateLimit-Reset', entry.resetTime);
    res.setHeader('Retry-After', retryAfter);

    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `You have exceeded the rate limit for your tier (${userTier})`,
      limit: limit,
      retryAfter: retryAfter,
      tier: userTier,
      upgradeUrl: '/pricing',
      suggestion: userTier === 'FREE'
        ? 'Upgrade to a paid tier for higher rate limits'
        : 'Consider upgrading to a higher tier for more requests'
    });
  }

  // Add this request to the list
  entry.requests.push(now);
  entry.count++;

  // Update reset time if needed
  if (now > entry.resetTime) {
    entry.resetTime = now + 60 * 1000;
  }

  rateLimitStore.set(key, entry);

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - entry.count));
  res.setHeader('X-RateLimit-Reset', entry.resetTime);

  next();
}

/**
 * Strict rate limiter for expensive operations
 * Use this for AI generation, video processing, etc.
 */
export function strictRateLimit(customLimits = {}) {
  return (req, res, next) => {
    const userId = getUserId(req);
    const userEmail = req.headers['x-user-email'] || req.body?.userEmail;
    const userTier = getUserTier(req);

    // Owner bypasses all rate limits
    if (isOwner(userEmail)) {
      return next();
    }

    // Custom limits for expensive operations (per hour)
    const STRICT_LIMITS = {
      'OWNER': Infinity,
      'LIFETIME_VIP': customLimits.vip || 500,
      'ELITE': customLimits.elite || 200,
      'VIP': customLimits.vip || 100,
      'PREMIUM': customLimits.premium || 50,
      'ENHANCED': customLimits.enhanced || 30,
      'STANDARD': customLimits.standard || 20,
      'FREE': customLimits.free || 10
    };

    const limit = STRICT_LIMITS[userTier] || STRICT_LIMITS.FREE;
    const key = `strict:${userId}:${req.path}`;
    const now = Date.now();
    const windowStart = now - 60 * 60 * 1000; // 1 hour window

    let entry = rateLimitStore.get(key);

    if (!entry) {
      entry = {
        count: 1,
        resetTime: now + 60 * 60 * 1000,
        requests: [now]
      };
      rateLimitStore.set(key, entry);

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', limit - 1);
      res.setHeader('X-RateLimit-Reset', entry.resetTime);

      return next();
    }

    // Filter requests within the hour window
    entry.requests = entry.requests.filter(time => time > windowStart);
    entry.count = entry.requests.length;

    if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', entry.resetTime);
      res.setHeader('Retry-After', retryAfter);

      return res.status(429).json({
        error: 'Hourly rate limit exceeded',
        message: `This operation has strict limits. You've used ${limit} requests this hour.`,
        limit: limit,
        retryAfter: retryAfter,
        tier: userTier,
        upgradeUrl: '/pricing'
      });
    }

    entry.requests.push(now);
    entry.count++;

    if (now > entry.resetTime) {
      entry.resetTime = now + 60 * 60 * 1000;
    }

    rateLimitStore.set(key, entry);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - entry.count));
    res.setHeader('X-RateLimit-Reset', entry.resetTime);

    next();
  };
}

/**
 * Get current rate limit status for a user
 */
export function getRateLimitStatus(userId, path = '/') {
  const key = `${userId}:${path}`;
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return {
      hasEntry: false,
      count: 0,
      remaining: null,
      resetTime: null
    };
  }

  return {
    hasEntry: true,
    count: entry.count,
    remaining: entry.remaining,
    resetTime: entry.resetTime,
    requests: entry.requests
  };
}

export default rateLimitByTier;

/**
 * API Input Validation Middleware
 * Provides reusable validators for common input patterns
 */

const validator = {
  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   * - At least 8 characters
   * - At least one number
   * - At least one letter
   */
  isValidPassword(password) {
    if (!password || password.length < 8) return false;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  },

  /**
   * Validate username format
   * - 3-30 characters
   * - Alphanumeric + underscore/hyphen
   * - No spaces
   */
  isValidUsername(username) {
    if (!username || username.length < 3 || username.length > 30) return false;
    return /^[a-zA-Z0-9_-]+$/.test(username);
  },

  /**
   * Validate post body
   * - Not empty
   * - Max 5000 characters
   */
  isValidPostBody(body) {
    if (!body || typeof body !== 'string') return false;
    const trimmed = body.trim();
    return trimmed.length > 0 && trimmed.length <= 5000;
  },

  /**
   * Validate comment body
   * - Not empty
   * - Max 2000 characters
   */
  isValidCommentBody(body) {
    if (!body || typeof body !== 'string') return false;
    const trimmed = body.trim();
    return trimmed.length > 0 && trimmed.length <= 2000;
  },

  /**
   * Validate visibility option
   */
  isValidVisibility(visibility) {
    const validOptions = ['PUBLIC', 'FRIENDS', 'SUBSCRIBERS', 'CUSTOM'];
    return validOptions.includes(visibility);
  },

  /**
   * Validate price (in cents)
   * - Must be positive integer
   * - Max $999.99
   */
  isValidPrice(priceCents) {
    const price = parseInt(priceCents);
    return !isNaN(price) && price >= 0 && price <= 99999;
  },

  /**
   * Validate array of URLs
   */
  isValidUrlArray(urls) {
    if (!Array.isArray(urls)) return false;
    if (urls.length > 10) return false; // Max 10 media items
    return urls.every(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
  },

  /**
   * Sanitize HTML input (prevent XSS)
   */
  sanitizeHTML(input) {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Sanitize plain text (keep formatting but remove dangerous chars)
   */
  sanitizeText(input) {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/[<>]/g, '')
      .trim();
  }
};

/**
 * Express middleware: Validate post creation
 */
function validatePostCreation(req, res, next) {
  const { body, visibility, isPaid, priceCents, mediaUrls } = req.body;

  // Validate body
  if (!validator.isValidPostBody(body)) {
    return res.status(400).json({
      error: 'Invalid post body',
      details: 'Post must be 1-5000 characters'
    });
  }

  // Validate visibility
  if (visibility && !validator.isValidVisibility(visibility)) {
    return res.status(400).json({
      error: 'Invalid visibility option',
      details: 'Must be PUBLIC, FRIENDS, SUBSCRIBERS, or CUSTOM'
    });
  }

  // Validate paid post
  if (isPaid) {
    if (!priceCents || !validator.isValidPrice(priceCents)) {
      return res.status(400).json({
        error: 'Invalid price',
        details: 'Price must be 0-99999 cents ($0-$999.99)'
      });
    }
  }

  // Validate media URLs
  if (mediaUrls && !validator.isValidUrlArray(mediaUrls)) {
    return res.status(400).json({
      error: 'Invalid media URLs',
      details: 'Must be valid URLs, max 10 items'
    });
  }

  // Sanitize body
  req.body.body = validator.sanitizeText(body);

  next();
}

/**
 * Express middleware: Validate comment creation
 */
function validateCommentCreation(req, res, next) {
  const { body, postId, parentCommentId } = req.body;

  // Validate body
  if (!validator.isValidCommentBody(body)) {
    return res.status(400).json({
      error: 'Invalid comment body',
      details: 'Comment must be 1-2000 characters'
    });
  }

  // Validate postId
  if (!postId || isNaN(parseInt(postId))) {
    return res.status(400).json({
      error: 'Invalid post ID'
    });
  }

  // Validate parentCommentId (if replying)
  if (parentCommentId && isNaN(parseInt(parentCommentId))) {
    return res.status(400).json({
      error: 'Invalid parent comment ID'
    });
  }

  // Sanitize body
  req.body.body = validator.sanitizeText(body);

  next();
}

/**
 * Express middleware: Validate signup
 */
function validateSignup(req, res, next) {
  const { email, password, username } = req.body;

  // Validate email
  if (!validator.isValidEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email format'
    });
  }

  // Validate password
  if (!validator.isValidPassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters with letters and numbers'
    });
  }

  // Validate username (if provided)
  if (username && !validator.isValidUsername(username)) {
    return res.status(400).json({
      error: 'Username must be 3-30 characters (letters, numbers, -, _)'
    });
  }

  next();
}

/**
 * Express middleware: Rate limit by IP
 * Simple in-memory rate limiter (use Redis in production)
 */
const rateLimitStore = new Map();

function rateLimit(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const key = `${ip}:${req.path}`;

    // Get or create rate limit record
    let record = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };

    // Reset if window expired
    if (now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
    }

    // Increment count
    record.count++;
    rateLimitStore.set(key, record);

    // Check if exceeded
    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: `${retryAfter}s`
      });
    }

    // Add headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.resetAt).toISOString());

    next();
  };
}

// Cleanup rate limit store every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

module.exports = {
  validator,
  validatePostCreation,
  validateCommentCreation,
  validateSignup,
  rateLimit
};

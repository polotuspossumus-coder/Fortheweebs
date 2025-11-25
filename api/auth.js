/**
 * Authentication API
 * Handles JWT token generation for owner/admin access
 */

const express = require('express');
const router = express.Router();
const { authenticateOwner, ROLES } = require('./middleware/authMiddleware');
const { authRateLimiter } = require('./middleware/rateLimiter');

const OWNER_EMAIL = 'polotuspossumus@gmail.com';

/**
 * POST /api/auth/owner
 * Authenticate as owner and receive JWT token
 * Rate limited to prevent brute force
 */
router.post('/owner', authRateLimiter, async (req, res) => {
  try {
    const { email, deviceId } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required',
        code: 'MISSING_EMAIL',
      });
    }

    // Verify owner credentials
    if (email !== OWNER_EMAIL) {
      // Log failed attempt
      console.warn('⚠️ Failed owner authentication attempt:', {
        email,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate JWT token
    const token = authenticateOwner(email, deviceId || req.ip);

    if (!token) {
      return res.status(500).json({
        error: 'Failed to generate token',
        code: 'TOKEN_GENERATION_FAILED',
      });
    }

    console.log('✅ Owner authenticated successfully:', {
      email,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      token,
      role: ROLES.OWNER,
      email,
      expiresIn: '24h',
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
});

/**
 * POST /api/auth/verify
 * Verify a JWT token (no rate limiting needed)
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token required',
        code: 'MISSING_TOKEN',
      });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          valid: false,
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN',
        });
      }

      res.json({
        valid: true,
        user: {
          email: user.email,
          role: user.role,
          userId: user.userId,
        },
      });
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      code: 'VERIFY_ERROR',
    });
  }
});

module.exports = router;

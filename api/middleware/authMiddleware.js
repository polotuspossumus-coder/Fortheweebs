/**
 * Authentication Middleware
 * JWT verification and role-based access control
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const OWNER_EMAIL = 'polotuspossumus@gmail.com';

if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable must be set');
}

const ROLES = {
  OWNER: 'owner',
  FOUNDER: 'founder',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user'
};

/**
 * Generate JWT token
 */
function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Authenticate token from request
 */
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1] || 
                req.headers['x-auth-token'] ||
                req.query.token ||
                req.body.token;

  if (!token) {
    return res.status(401).json({
      error: 'No token provided',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Authenticate owner (polotuspossumus@gmail.com)
 */
function authenticateOwner(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.email !== OWNER_EMAIL || req.user.role !== ROLES.OWNER) {
      return res.status(403).json({
        error: 'Owner access required',
        code: 'OWNER_ONLY'
      });
    }
    next();
  });
}

/**
 * Require specific role
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    authenticateToken(req, res, () => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
          required: allowedRoles,
          current: req.user.role
        });
      }
      next();
    });
  };
}

/**
 * Require owner or founder
 */
function requireOwner(req, res, next) {
  return requireRole(ROLES.OWNER, ROLES.FOUNDER)(req, res, next);
}

/**
 * Require admin or higher
 */
function requireAdmin(req, res, next) {
  return requireRole(ROLES.OWNER, ROLES.FOUNDER, ROLES.ADMIN)(req, res, next);
}

/**
 * Optional authentication (doesn't fail if no token)
 */
function optionalAuth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1] || 
                req.headers['x-auth-token'] ||
                req.query.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    req.user = null;
  }
  next();
}

module.exports = {
  generateToken,
  authenticateToken,
  authenticateOwner,
  requireRole,
  requireOwner,
  requireAdmin,
  optionalAuth,
  ROLES
};

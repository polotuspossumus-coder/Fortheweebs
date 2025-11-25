/**
 * Authentication Middleware for Governance API
 * Enforces JWT authentication and role-based access control
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const OWNER_EMAIL = 'polotuspossumus@gmail.com';

// Role hierarchy
const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
};

// Role permissions
const PERMISSIONS = {
  [ROLES.OWNER]: ['read', 'write', 'override', 'admin'],
  [ROLES.ADMIN]: ['read', 'write', 'override'],
  [ROLES.MODERATOR]: ['read', 'write'],
  [ROLES.USER]: ['read'],
};

/**
 * Verify JWT token and attach user to request
 */
function authenticateToken(req, res, next) {
  // Check for token in multiple places
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  const sessionToken = req.cookies?.sessionToken;
  const finalToken = token || sessionToken;

  if (!finalToken) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NO_TOKEN',
    });
  }

  jwt.verify(finalToken, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      });
    }

    req.user = user;
    next();
  });
}

/**
 * Require specific role (or higher in hierarchy)
 */
function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NO_USER',
      });
    }

    const userRole = req.user.role || ROLES.USER;
    const userPermissions = PERMISSIONS[userRole] || [];
    const requiredPermissions = PERMISSIONS[requiredRole] || [];

    // Check if user has all required permissions
    const hasPermission = requiredPermissions.every(perm =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      // Log unauthorized attempt
      console.warn('⚠️ Unauthorized access attempt:', {
        user: req.user.email,
        role: userRole,
        requiredRole,
        path: req.path,
        ip: req.ip,
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        required: requiredRole,
        current: userRole,
      });
    }

    next();
  };
}

/**
 * Require owner (highest authority)
 */
function requireOwner(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NO_USER',
    });
  }

  if (req.user.role !== ROLES.OWNER && req.user.email !== OWNER_EMAIL) {
    console.warn('⚠️ Non-owner attempted owner-only action:', {
      user: req.user.email,
      role: req.user.role,
      path: req.path,
      ip: req.ip,
    });

    return res.status(403).json({
      error: 'Owner access required',
      code: 'OWNER_ONLY',
    });
  }

  next();
}

/**
 * Generate JWT for user
 */
function generateToken(user) {
  const payload = {
    email: user.email,
    role: user.role || ROLES.USER,
    userId: user.id,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Validate owner credentials and generate token
 */
function authenticateOwner(email, deviceId) {
  if (email !== OWNER_EMAIL) {
    return null;
  }

  const token = generateToken({
    email,
    role: ROLES.OWNER,
    id: 'owner',
    deviceId,
  });

  return token;
}

module.exports = {
  authenticateToken,
  requireRole,
  requireOwner,
  generateToken,
  authenticateOwner,
  ROLES,
  PERMISSIONS,
};

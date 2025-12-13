/**
 * Authentication Middleware
 * JWT verification for Mico governance and protected routes
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable must be set');
}

/**
 * Verify JWT Token
 */
function verifyToken(req, res, next) {
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
 * Verify Admin Role
 */
function verifyAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required',
            code: 'NO_AUTH'
        });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'founder') {
        return res.status(403).json({
            error: 'Admin access required',
            code: 'INSUFFICIENT_PERMISSIONS'
        });
    }

    next();
}

/**
 * Verify Creator Role
 */
function verifyCreator(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required',
            code: 'NO_AUTH'
        });
    }

    if (!req.user.isCreator && req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Creator access required',
            code: 'NOT_CREATOR'
        });
    }

    next();
}

/**
 * Generate JWT Token
 */
function generateToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify Tier Access
 */
function verifyTier(requiredTier) {
    const tierLevels = {
        'free': 0,
        'standard': 1,
        'enhanced': 2,
        'premium': 3,
        'vip': 4,
        'elite': 5
    };

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                code: 'NO_AUTH'
            });
        }

        const userTierLevel = tierLevels[req.user.tier] || 0;
        const requiredTierLevel = tierLevels[requiredTier] || 0;

        if (userTierLevel < requiredTierLevel) {
            return res.status(403).json({
                error: `${requiredTier} tier or higher required`,
                code: 'INSUFFICIENT_TIER',
                currentTier: req.user.tier,
                requiredTier: requiredTier
            });
        }

        next();
    };
}

module.exports = {
    verifyToken,
    verifyAdmin,
    verifyCreator,
    verifyTier,
    generateToken
};

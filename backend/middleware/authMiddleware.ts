// Simple authentication middleware stub
export default function authMiddleware(req, res, next) {
  // Example: check for an Authorization header
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

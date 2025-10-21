import jwt from 'jsonwebtoken';

export const requireRole = (role) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== role && role !== 'any') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};
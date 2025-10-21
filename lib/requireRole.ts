import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      if (decoded.role !== role && role !== 'any') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

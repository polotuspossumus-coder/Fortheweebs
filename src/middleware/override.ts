import type { Request, Response, NextFunction } from 'express';

// Secure override: Only allow if user email matches env var
export function enforceOverride(req: Request, res: Response, next: NextFunction) {
  const overrideEmail = process.env.OVERRIDE_EMAIL;
  const user = req.user;
  if (user && overrideEmail && user.email === overrideEmail) {
    req.overrideAccess = true;
    // Optionally log override access
    console.log(`[OVERRIDE] Access granted for ${user.email} at ${new Date().toISOString()}`);
  }
  next();
}

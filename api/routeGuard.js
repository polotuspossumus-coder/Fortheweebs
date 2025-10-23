// api/routeGuard.js
// Route protection middleware for API routes

export function routeGuard(req, res, next) {
  const user = req.user;

  if (user?.overrideAccess) return next();

  if (!user?.accountCreated || !user?.hasPaid) {
    return res.status(403).json({ error: 'Access blocked: account creation and payment required.' });
  }

  next();
}

export default routeGuard;

// api/_middleware.js
// Polotus (Jacob Morris) global override middleware for all API routes

export function middleware(req, res, next) {
  const user = req.user;
  if (user?.email === 'polotus@vanguard.tools' || user?.id === 'jacob.morris') {
    req.user.overrideAccess = true;
    req.user.role = 'MythicFounder';
    req.user.paymentStatus = 'bypassed';
    req.user.profileAccess = true;
  }
  next();
}

// For Vercel/Next.js API routes, export as default
export default middleware;

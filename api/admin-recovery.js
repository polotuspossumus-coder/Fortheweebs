// Admin Recovery API - Force grant admin access
// POST /api/admin-recovery with { email: "polotuspossumus@gmail.com", secret: "your_secret" }

const OWNER_EMAIL = 'polotuspossumus@gmail.com';
const RECOVERY_SECRET = process.env.ADMIN_RECOVERY_SECRET || 'change_this_secret';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, secret } = req.body;

  // Verify secret
  if (secret !== RECOVERY_SECRET) {
    return res.status(401).json({ error: 'Invalid recovery secret' });
  }

  // Verify email
  if (email?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Generate admin token
  const adminToken = {
    userId: 'owner',
    email: OWNER_EMAIL,
    adminAuthenticated: true,
    ownerVerified: true,
    hasOnboarded: true,
    legalAccepted: true,
    tosAccepted: true,
    privacyAccepted: true,
    userTier: 'LIFETIME_VIP',
    timestamp: Date.now()
  };

  return res.status(200).json({
    success: true,
    message: 'Admin access granted',
    token: adminToken
  });
}

// VIP Access Helper
const LIFETIME_VIP_EMAILS = [
  'polotuspossumus@gmail.com', // Owner
  'chesed04@aol.com',
  'Colbyg123f@gmail.com',
  'PerryMorr94@gmail.com',
  'remyvogt@gmail.com',
  'kh@savantenergy.com',
  'Bleska@mindspring.com',
  'palmlana@yahoo.com',
  'Billyxfitzgerald@yahoo.com',
  'Yeahitsmeangel@yahoo.com',
  'Atolbert66@gmail.com',
  'brookewhitley530@gmail.com'
];

export function hasVIPAccess(email) {
  if (!email) return false;
  return LIFETIME_VIP_EMAILS.includes(email.toLowerCase());
}

export function isOwner(email) {
  return email?.toLowerCase() === 'polotuspossumus@gmail.com';
}

export function canBypassPayment(email, userId) {
  // Owner and VIP list bypass all payment gates
  if (isOwner(email)) return true;
  if (hasVIPAccess(email)) return true;
  
  // Check if user has already paid for $1000 tier
  const userTier = localStorage.getItem('userTier');
  return userTier === 'PREMIUM_1000' || userTier === 'LIFETIME_VIP';
}

export { LIFETIME_VIP_EMAILS };

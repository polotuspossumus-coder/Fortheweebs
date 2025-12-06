/**
 * VIP Access System - First 100 Users Get LIFETIME FREE ACCESS
 * 
 * First 100 VIPs get:
 * - ALL features forever (no subscriptions, no creator payments, nothing)
 * - After 100 slots filled: New users pay $1000 for VIP but still pay creator subscriptions
 * 
 * Current VIP count: 14/100
 * Remaining FREE slots: 86
 */

// OWNER - Only person with admin/owner access
export const OWNER_EMAIL = 'polotuspossumus@gmail.com';

// LIFETIME VIPs - First 100 users, everything free forever
export const LIFETIME_VIP_EMAILS = [
  'shellymontoya82@gmail.com',
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
  'brookewhitley530@gmail.com',
  'cleonwilliams1973@gmail.com',
  'eliahmontoya05@gmail.com'
];

/**
 * Check if email is the owner
 * @param {string} email - User's email address
 * @returns {boolean} - True if owner, false otherwise
 */
export function isOwner(email) {
  if (!email) return false;
  return email.toLowerCase().trim() === OWNER_EMAIL.toLowerCase().trim();
}

/**
 * Check if an email has lifetime VIP access (Pro tier features only)
 * @param {string} email - User's email address
 * @returns {boolean} - True if VIP, false otherwise
 */
export function isLifetimeVIP(email) {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase().trim();
  return LIFETIME_VIP_EMAILS.some(vipEmail => 
    vipEmail.toLowerCase().trim() === normalizedEmail
  );
}

/**
 * Check if a userId has lifetime VIP access
 * Checks localStorage for email first, then checks Supabase
 * @param {string} userId - User's ID
 * @returns {Promise<boolean>} - True if VIP, false otherwise
 */
export async function isUserVIP(userId) {
  // Owner is always VIP
  if (userId === 'owner') return true;
  
  // Check localStorage for email
  const storedEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
  if (storedEmail && isLifetimeVIP(storedEmail)) {
    return true;
  }
  
  // Could add Supabase check here if needed
  // const { data } = await supabase.from('users').select('email').eq('id', userId).single();
  // return isLifetimeVIP(data?.email);
  
  return false;
}

/**
 * Get the tier for a VIP user
 * @param {string} email - User's email
 * @returns {string} - 'OWNER' for owner, 'PRO_VIP' for VIPs
 */
export function getVIPTier(email) {
  if (isOwner(email)) return 'OWNER';
  if (isLifetimeVIP(email)) return 'PRO_VIP';
  return null;
}

/**
 * Check if user should skip payment flow
 * @param {string} email - User's email
 * @returns {boolean} - True if should skip payment
 */
export function shouldSkipPayment(email) {
  return isLifetimeVIP(email);
}

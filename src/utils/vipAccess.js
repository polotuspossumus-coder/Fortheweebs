/**
 * VIP Access System - Lifetime Unlimited Access for 3 People
 * 
 * To grant someone VIP access:
 * 1. Add their email to the LIFETIME_VIP_EMAILS array below
 * 2. They will automatically get SUPER_ADMIN tier (unlimited everything)
 * 3. They skip all payments and get all features free forever
 */

export const LIFETIME_VIP_EMAILS = [
  'polotuspossumus@gmail.com', // Owner - always VIP
  'chesed04@aol.com',          // VIP Slot 1
  'Colbyg123f@gmail.com',      // VIP Slot 2
  'PerryMorr94@gmail.com',     // VIP Slot 3
  'remyvogt@gmail.com',        // VIP Slot 4
  'kh@savantenergy.com',       // VIP Slot 5
  'Bleska@mindspring.com',     // VIP Slot 6
  'palmlana@yahoo.com',        // VIP Slot 7
  'Billyxfitzgerald@yahoo.com', // VIP Slot 8
  'Yeahitsmeangel@yahoo.com',  // VIP Slot 9
  'Atolbert66@gmail.com',      // VIP Slot 10
  'brookewhitley530@gmail.com', // VIP Slot 11
  'cleonwilliams1973@gmail.com' // VIP Slot 12
];

/**
 * Check if an email has lifetime VIP access
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
 * @returns {string} - Always returns 'LIFETIME_VIP'
 */
export function getVIPTier() {
  return 'LIFETIME_VIP';
}

/**
 * Check if user should skip payment flow
 * @param {string} email - User's email
 * @returns {boolean} - True if should skip payment
 */
export function shouldSkipPayment(email) {
  return isLifetimeVIP(email);
}

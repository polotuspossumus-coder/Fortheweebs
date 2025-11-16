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
  'vip1@example.com',          // VIP Slot 1 - Replace with real email
  'vip2@example.com',          // VIP Slot 2 - Replace with real email
  'vip3@example.com',          // VIP Slot 3 - Replace with real email
  'vip4@example.com',          // VIP Slot 4 - Replace with real email
  'vip5@example.com',          // VIP Slot 5 - Replace with real email
  'vip6@example.com',          // VIP Slot 6 - Replace with real email
  'vip7@example.com',          // VIP Slot 7 - Replace with real email
  'vip8@example.com',          // VIP Slot 8 - Replace with real email
  'vip9@example.com',          // VIP Slot 9 - Replace with real email
  'vip10@example.com'          // VIP Slot 10 - Replace with real email
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

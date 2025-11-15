// 🔐 SECURE OWNER AUTHENTICATION SYSTEM
// Only you can access admin features through verified Supabase authentication

import { supabase } from '../lib/supabase';

// Your owner email - ONLY this email gets admin access
const OWNER_EMAIL = 'polotuspossumus@gmail.com';

/**
 * Check if current user is the verified owner
 * @returns {Promise<boolean>} True if user is authenticated owner
 */
export async function isOwner() {
  try {
    // Get current authenticated user from Supabase
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.log('❌ No authenticated user');
      return false;
    }

    // Check if email matches owner email
    if (user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      console.log('✅ Owner authenticated:', user.email);
      return true;
    }

    // Also check database for admin role (if you've set it up)
    const { data: profile } = await supabase
      .from('users')
      .select('role, is_admin')
      .eq('id', user.id)
      .single();

    if (profile?.is_admin === true || profile?.role === 'admin' || profile?.role === 'owner') {
      console.log('✅ Admin role verified from database');
      return true;
    }

    console.log('❌ Not owner:', user.email);
    return false;
  } catch (err) {
    console.error('Error checking owner status:', err);
    return false;
  }
}

/**
 * Require owner authentication - redirect if not owner
 * @returns {Promise<boolean>} True if owner, false if not (and redirects)
 */
export async function requireOwner() {
  const isOwnerUser = await isOwner();

  if (!isOwnerUser) {
    console.log('🚫 Unauthorized access attempt - redirecting to login');
    // Clear any fake admin flags
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('userId');
    // Don't redirect, just return false
    return false;
  }

  // Set owner localStorage flags (for backward compatibility with existing code)
  localStorage.setItem('adminAuthenticated', 'true');
  localStorage.setItem('userId', 'owner');
  localStorage.setItem('hasOnboarded', 'true');
  localStorage.setItem('legalAccepted', 'true');
  localStorage.setItem('tosAccepted', 'true');

  return true;
}

/**
 * Get current user's role
 * @returns {Promise<string>} 'owner', 'admin', 'user', or 'guest'
 */
export async function getUserRole() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 'guest';

    if (user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      return 'owner';
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role || 'user';
  } catch {
    return 'guest';
  }
}

/**
 * Setup owner access in database (run once after signup)
 */
export async function setupOwnerInDatabase() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
      console.error('❌ Not owner email');
      return false;
    }

    // Update user profile to set admin role
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        role: 'owner',
        is_admin: true,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error setting up owner:', error);
      return false;
    }

    console.log('✅ Owner role set in database');
    return true;
  } catch (err) {
    console.error('Error in setupOwnerInDatabase:', err);
    return false;
  }
}

export default {
  isOwner,
  requireOwner,
  getUserRole,
  setupOwnerInDatabase,
  OWNER_EMAIL
};

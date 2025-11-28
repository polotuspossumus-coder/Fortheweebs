// Grant VIP Access API
// POST /api/grant-vip with { email: "user@example.com", ownerEmail: "polotuspossumus@gmail.com" }

import { createClient } from '@supabase/supabase-js';

const OWNER_EMAIL = 'polotuspossumus@gmail.com';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, ownerEmail } = req.body;

  // Verify owner
  if (ownerEmail?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: 'Only owner can grant VIP access' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return res.status(500).json({ error: 'Database error', details: fetchError.message });
    }

    if (existingUser) {
      // Update existing user to LIFETIME_VIP
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          tier: 'LIFETIME_VIP',
          updated_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase())
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return res.status(500).json({ error: 'Failed to grant VIP', details: updateError.message });
      }

      return res.status(200).json({
        success: true,
        message: `VIP access granted to ${email}`,
        user: updated
      });
    } else {
      // Create new user with LIFETIME_VIP
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          tier: 'LIFETIME_VIP',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create VIP user', details: createError.message });
      }

      return res.status(201).json({
        success: true,
        message: `VIP user created for ${email}`,
        user: newUser
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

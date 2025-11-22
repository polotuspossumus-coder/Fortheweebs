/**
 * API Route: Family Access System (CommonJS version)
 * Generate special access codes for family/friends
 * - Full free access codes (for Mom, Dad, testers)
 * - Supporter plan codes ($20/month toward $1000 tier)
 */

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * List all access codes (admin only)
 * GET /api/family-access/list
 */
router.get('/list', async (req, res) => {
  try {
    const { data, error } = await supabase
        .from('family_access_codes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return res.status(200).json({ codes: data || [] });
  } catch (error) {
    console.error('Error listing access codes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Generate new access code (admin only)
 * POST /api/family-access/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { adminId, name, type, notes, maxUses = 5, expiresInDays = 365 } = req.body;

    if (!adminId || !name || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique code
    const code = `FAMILY-${name.toUpperCase().replace(/\s+/g, '-')}-${Date.now().toString(36).toUpperCase()}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Determine tier based on type
    const tier = type === 'free' ? 'CREATOR' : 'SUPPORTER';

    const { data, error } = await supabase
        .from('family_access_codes')
        .insert({
            code: code,
            creator_id: adminId,
            tier: tier,
            max_uses: maxUses,
            uses_count: 0,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    const baseUrl = process.env.VITE_APP_URL || 'http://localhost:3002';
    const link = `${baseUrl}?familyCode=${code}`;

    return res.status(200).json({
      code: data,
      link: link,
      message: 'Access code created successfully'
    });
  } catch (error) {
    console.error('Error generating access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Verify access code is valid
 * GET /api/family-access/verify?code=XXX
 */
router.get('/verify', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    const { data, error } = await supabase
        .from('family_access_codes')
        .select('*')
        .eq('code', code)
        .single();

    if (error || !data) {
      return res.status(404).json({
        valid: false,
        error: 'Invalid or expired code'
      });
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      return res.status(400).json({
        valid: false,
        error: 'Code has expired'
      });
    }

    // Check if max uses reached
    if (data.uses_count >= data.max_uses) {
      return res.status(400).json({
        valid: false,
        error: 'Code has reached maximum uses'
      });
    }

    // Return code info
    return res.status(200).json({
      valid: true,
      tier: data.tier,
      code: data.code,
      usesRemaining: data.max_uses - data.uses_count
    });

  } catch (error) {
    console.error('Error verifying access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Redeem access code and grant access
 * POST /api/family-access/redeem
 */
router.post('/redeem', async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Code and userId required' });
    }

    // Get the code
    const { data: accessCode, error: getError } = await supabase
        .from('family_access_codes')
        .select('*')
        .eq('code', code)
        .single();

    if (getError || !accessCode) {
      return res.status(400).json({ success: false, message: 'Invalid code' });
    }

    // Validate code
    if (new Date(accessCode.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Code expired' });
    }

    if (accessCode.uses_count >= accessCode.max_uses) {
      return res.status(400).json({ success: false, message: 'Code max uses reached' });
    }

    // Check if user already redeemed
    const { data: existing } = await supabase
        .from('family_access_redemptions')
        .select('*')
        .eq('code_id', accessCode.id)
        .eq('user_id', userId)
        .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Code already redeemed by this user' });
    }

    // Record redemption
    await supabase
        .from('family_access_redemptions')
        .insert({
            code_id: accessCode.id,
            user_id: userId,
            redeemed_at: new Date().toISOString()
        });

    // Increment use count
    await supabase
        .from('family_access_codes')
        .update({
            uses_count: accessCode.uses_count + 1,
            updated_at: new Date().toISOString()
        })
        .eq('id', accessCode.id);

    // Update user tier
    await supabase
        .from('users')
        .upsert({
            id: userId,
            payment_tier: accessCode.tier,
            tier_updated_at: new Date().toISOString(),
            payment_status: 'family_access',
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'id'
        });

    return res.status(200).json({
      success: true,
      message: 'Access code redeemed successfully',
      tier: accessCode.tier,
      code: code
    });

  } catch (error) {
    console.error('Error redeeming access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete access code (admin only)
 * DELETE /api/family-access/delete?id=XXX
 */
router.delete('/delete', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Code ID required' });
    }

    const { error } = await supabase
        .from('family_access_codes')
        .delete()
        .eq('id', id);

    if (error) {
        throw error;
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error deleting access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

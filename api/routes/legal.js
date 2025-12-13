const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Track Legal Acceptance
 * POST /api/legal/track-acceptance
 * Records user acceptance of Terms and Privacy Policy with timestamp, IP, and user agent
 */
router.post('/track-acceptance', async (req, res) => {
  try {
    const { userId, termsVersion = 'v2.0', privacyVersion = 'v2.0' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user's IP address (handle proxy headers)
    const ipAddress = 
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      '0.0.0.0';

    // Get user agent
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Insert into legal_acceptances table
    const { data, error } = await supabase
      .from('legal_acceptances')
      .insert({
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        terms_version: termsVersion,
        privacy_version: privacyVersion,
        accepted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to track legal acceptance' });
    }


    return res.json({
      success: true,
      message: 'Legal acceptance recorded',
      acceptance: {
        id: data.id,
        acceptedAt: data.accepted_at,
        termsVersion: data.terms_version,
        privacyVersion: data.privacy_version
      }
    });
  } catch (error) {
    console.error('Track acceptance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get User's Legal Acceptance History
 * GET /api/legal/acceptance-history/:userId
 * Returns all legal acceptances for a user (for audit purposes)
 */
router.get('/acceptance-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('legal_acceptances')
      .select('*')
      .eq('user_id', userId)
      .order('accepted_at', { ascending: false });

    if (error) {
      console.error('Legal acceptance history error:', error);
      return res.status(500).json({ error: 'Failed to retrieve acceptance history' });
    }

    return res.json({
      success: true,
      acceptances: data
    });
  } catch (error) {
    console.error('Acceptance history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Check if User Has Accepted Latest Terms
 * GET /api/legal/check-acceptance/:userId
 * Returns whether user has accepted the latest version of legal docs
 */
router.get('/check-acceptance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requiredTermsVersion = 'v2.0';
    const requiredPrivacyVersion = 'v2.0';

    const { data, error } = await supabase
      .from('legal_acceptances')
      .select('*')
      .eq('user_id', userId)
      .eq('terms_version', requiredTermsVersion)
      .eq('privacy_version', requiredPrivacyVersion)
      .order('accepted_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      return res.status(500).json({ error: 'Failed to check acceptance' });
    }

    const hasAccepted = !!data;

    return res.json({
      success: true,
      hasAccepted,
      latestAcceptance: data || null,
      requiredVersions: {
        terms: requiredTermsVersion,
        privacy: requiredPrivacyVersion
      }
    });
  } catch (error) {
    console.error('Check acceptance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

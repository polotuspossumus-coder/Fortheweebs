/**
 * MODERATION ACTIONS API
 * Handles account termination, IP blocking, and moderation actions
 * Called by AI CSAM detection system
 */

const express = require('express');
const { supabase } = require('../src/lib/supabase-server');

const router = express.Router();

/**
 * Terminate Account for CSAM
 * POST /api/moderation/terminate-account
 */
router.post('/terminate-account', async (req, res) => {
  try {
    const { userId, incidentId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    console.log(`🚨 TERMINATING ACCOUNT: ${userId} - Reason: ${reason || 'CSAM_DETECTED'}`);

    // Insert ban record
    const { data: ban, error: banError } = await supabase
      .from('user_bans')
      .insert({
        user_id: userId,
        reason: reason || 'CSAM_DETECTED',
        ban_type: 'CSAM_ZERO_TOLERANCE',
        incident_id: incidentId,
        can_appeal: false, // NO appeals for CSAM
        banned_at: new Date().toISOString()
      });

    if (banError) {
      console.error('Ban record error:', banError);
      // Continue even if ban record fails - termination is priority
    }

    // Delete user auth sessions (force logout everywhere)
    try {
      const { error: sessionError } = await supabase.auth.admin.deleteUser(userId);
      if (sessionError) {
        console.error('Session deletion error:', sessionError);
      }
    } catch (authError) {
      console.error('Auth deletion error:', authError);
    }

    res.json({
      success: true,
      message: 'Account terminated',
      userId: userId,
      incidentId: incidentId
    });

  } catch (error) {
    console.error('Account termination error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Block IP Address
 * POST /api/moderation/block-ip
 */
router.post('/block-ip', async (req, res) => {
  try {
    const { ipAddress, reason, incidentId, userId } = req.body;

    if (!ipAddress) {
      return res.status(400).json({ error: 'ipAddress required' });
    }

    console.log(`🚨 BLOCKING IP: ${ipAddress} - Reason: ${reason || 'CSAM_DETECTED'}`);

    // Check if already blocked
    const { data: existing } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', ipAddress)
      .single();

    if (existing) {
      return res.json({
        success: true,
        message: 'IP already blocked',
        alreadyBlocked: true
      });
    }

    // Insert block record
    const { data, error } = await supabase
      .from('blocked_ips')
      .insert({
        ip_address: ipAddress,
        reason: reason || 'CSAM_DETECTED',
        block_type: 'PERMANENT',
        incident_id: incidentId,
        user_id: userId,
        blocked_at: new Date().toISOString()
      });

    if (error) throw error;

    res.json({
      success: true,
      message: 'IP blocked permanently',
      ipAddress: ipAddress
    });

  } catch (error) {
    console.error('IP blocking error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Check if IP is Blocked
 * GET /api/moderation/check-ip/:ipAddress
 */
router.get('/check-ip/:ipAddress', async (req, res) => {
  try {
    const { ipAddress } = req.params;

    const { data, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', ipAddress)
      .or('expires_at.is.null,expires_at.gt.now()')
      .maybeSingle();

    if (error) throw error;

    res.json({
      isBlocked: !!data,
      reason: data?.reason,
      blockedAt: data?.blocked_at,
      incidentId: data?.incident_id
    });

  } catch (error) {
    console.error('IP check error:', error);
    res.json({ isBlocked: false });
  }
});

/**
 * Check if User is Banned
 * GET /api/moderation/check-ban/:userId
 */
router.get('/check-ban/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error} = await supabase
      .from('user_bans')
      .select('*')
      .eq('user_id', userId)
      .or('expires_at.is.null,expires_at.gt.now()')
      .maybeSingle();

    if (error) throw error;

    res.json({
      isBanned: !!data,
      reason: data?.reason,
      banType: data?.ban_type,
      bannedAt: data?.banned_at,
      canAppeal: data?.can_appeal || false
    });

  } catch (error) {
    console.error('Ban check error:', error);
    res.json({ isBanned: false });
  }
});

/**
 * Log CSAM Incident (called by AI detection)
 * POST /api/moderation/log-csam-incident
 */
router.post('/log-csam-incident', async (req, res) => {
  try {
    const {
      incidentId,
      userId,
      ipAddress,
      confidence,
      analysis,
      scanId,
      imageName,
      imageSize,
      imageType
    } = req.body;

    const { data, error } = await supabase
      .from('csam_incidents')
      .insert({
        incident_id: incidentId,
        user_id: userId,
        ip_address: ipAddress,
        confidence: confidence,
        detection_method: 'AI_VISION_GPT4',
        scan_id: scanId,
        analysis: analysis,
        image_name: imageName,
        image_size: imageSize,
        image_type: imageType,
        detected_at: new Date().toISOString(),
        evidence_retain_until: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 7 years
        account_terminated: true,
        ip_blocked: true
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      csamIncidentId: data.id,
      incidentId: incidentId
    });

  } catch (error) {
    console.error('CSAM incident logging error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Log Pending NCMEC Report
 * POST /api/moderation/log-ncmec-report
 */
router.post('/log-ncmec-report', async (req, res) => {
  try {
    const { incidentId, csamIncidentId, reportData } = req.body;

    const { data, error } = await supabase
      .from('pending_ncmec_reports')
      .insert({
        incident_id: incidentId,
        csam_incident_id: csamIncidentId,
        report_data: reportData,
        detected_at: new Date().toISOString(),
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        status: 'PENDING'
      });

    if (error) throw error;

    res.json({ success: true, message: 'NCMEC report logged - file within 24 hours' });

  } catch (error) {
    console.error('NCMEC report logging error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Pending NCMEC Reports (for admin dashboard)
 * GET /api/moderation/pending-ncmec-reports
 */
router.get('/pending-ncmec-reports', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pending_ncmec_reports')
      .select('*')
      .eq('status', 'PENDING')
      .order('deadline', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      reports: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Fetch pending reports error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Manual Review Queue (for admin dashboard)
 * GET /api/moderation/review-queue
 */
router.get('/review-queue', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('manual_review_queue')
      .select('*')
      .eq('status', 'PENDING')
      .order('priority', { ascending: false })
      .order('flagged_at', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      queue: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Fetch review queue error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Alert Admin about NCMEC Reporting Failure
 * POST /api/moderation/alert-ncmec-failure
 */
router.post('/alert-ncmec-failure', async (req, res) => {
  try {
    const alert = req.body;

    console.error('🚨🚨🚨 NCMEC REPORTING FAILURE - SENDING ALERT 🚨🚨🚨');
    console.error(alert);

    // TODO: Add your email service here
    // Example with Resend (free 100 emails/day):
    /*
    const Resend = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'alerts@fortheweebs.com',
      to: process.env.LEGAL_CONTACT_EMAIL || 'legal@fortheweebs.com',
      subject: '🚨 URGENT: NCMEC Report Failed - Action Required Within 24 Hours',
      html: `
        <h1 style="color: red;">🚨 NCMEC REPORTING FAILURE</h1>
        <p><strong>Incident ID:</strong> ${alert.incidentId}</p>
        <p><strong>Error:</strong> ${alert.error}</p>
        <p><strong>Deadline:</strong> ${alert.deadline}</p>
        <h2>Required Actions:</h2>
        <ol>
          ${alert.actions.map(action => `<li>${action}</li>`).join('')}
        </ol>
        <p style="color: red; font-weight: bold;">
          Federal law requires filing within 24 hours. Failure to report = $50,000 fine + criminal prosecution.
        </p>
      `
    });
    */

    // For now, just log (you'll add email service later)
    res.json({ success: true, message: 'Alert logged (email not configured yet)' });

  } catch (error) {
    console.error('Alert sending error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

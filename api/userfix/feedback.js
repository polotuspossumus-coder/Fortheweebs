// api/userfix/feedback.js - User feedback and bug reports
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { checkSoftBan, publicLimiter } = require('../../utils/rateLimit');
const { sanitizeText } = require('../../utils/validation');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Submit bug report or feedback
router.post('/report', checkSoftBan, publicLimiter, async (req, res) => {
  const { report_type, message, page_url, severity, user_id } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }
  
  try {
    const { data, error } = await supabase
      .from('ftw_reports')
      .insert({
        report_type: report_type || 'bug',
        user_id,
        message: sanitizeText(message),
        page_url,
        severity: severity || 'low',
        metadata: metadata || {},
        status: 'open',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      status: 'reported',
      reportId: data.id,
      message: 'Thank you for your report! Our team will review it.',
    });
  } catch (error) {
    console.error('[Feedback] Report failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Attempt to reproduce issue
router.post('/reproduce', checkSoftBan, publicLimiter, async (req, res) => {
  const { report_id, reproduced, notes } = req.body;
  
  if (!report_id) {
    return res.status(400).json({ error: 'report_id is required' });
  }
  
  try {
    // Update report with reproduction info
    const { data, error } = await supabase
      .from('ftw_reports')
      .update({
        metadata: {
          reproduced,
          reproduction_notes: sanitizeText(notes || ''),
          reproduction_timestamp: new Date().toISOString(),
        },
      })
      .eq('id', report_id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      status: 'updated',
      report: data,
    });
  } catch (error) {
    console.error('[Feedback] Reproduction update failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's reports
router.get('/my-reports', async (req, res) => {
  const userId = req.query.user_id;
  
  if (!userId) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  
  try {
    const { data, error } = await supabase
      .from('ftw_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

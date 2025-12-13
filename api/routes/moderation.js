// Automated Content Moderation API
// Auto-flags suspicious uploads using AI detection (no manual review needed)

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Moderation thresholds
const MODERATION_CONFIG = {
  // OpenAI moderation API categories
  sexual: 0.8,           // High threshold for adult content platform
  'sexual/minors': 0.01, // ZERO TOLERANCE for CSAM
  violence: 0.7,
  'violence/graphic': 0.6,
  harassment: 0.7,
  'harassment/threatening': 0.5,
  'hate': 0.6,
  'hate/threatening': 0.5,
  'self-harm': 0.5,
  'self-harm/intent': 0.3,
  'self-harm/instructions': 0.3,
  
  // Custom detection rules
  spam_keywords: ['click here', 'free money', 'buy now', 'limited offer', 'act now'],
  piracy_keywords: ['torrent', 'crack', 'keygen', 'leaked episode', 'free download'],
  suspicious_file_types: ['.exe', '.bat', '.sh', '.cmd', '.scr'],
  max_file_size_mb: 500 // Flag files over 500MB
};

/**
 * Auto-moderate uploaded content
 * POST /api/moderation/auto-flag
 * Body: { contentUrl, contentType, title, description, userId }
 */
router.post('/auto-flag', async (req, res) => {
  try {
    const { userId, contentUrl, contentType, title, description, filename } = req.body;

    if (!contentUrl || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }


    const flags = [];
    let actionTaken = 'none'; // 'none', 'flag', 'block', 'ban'
    let confidence = 0;

    // 1. TEXT MODERATION (Title + Description)
    const textToModerate = `${title || ''} ${description || ''}`.trim();
    if (textToModerate) {
      try {
        const moderationResult = await openai.moderations.create({
          input: textToModerate
        });

        const results = moderationResult.results[0];
        
        // Check each category against thresholds
        for (const [category, score] of Object.entries(results.category_scores)) {
          const threshold = MODERATION_CONFIG[category];
          if (threshold && score > threshold) {
            flags.push({
              type: 'openai_moderation',
              category,
              score,
              threshold,
              severity: score > threshold * 1.5 ? 'critical' : 'high'
            });
            confidence = Math.max(confidence, score);
          }
        }

        // ZERO TOLERANCE for minors content
        if (results.category_scores['sexual/minors'] > 0.01) {
          actionTaken = 'ban';
          flags.push({
            type: 'csam_detection',
            category: 'sexual/minors',
            score: results.category_scores['sexual/minors'],
            severity: 'critical',
            action: 'IMMEDIATE_BAN'
          });
        }
      } catch (error) {
        console.error('OpenAI moderation error:', error);
        // Continue with other checks
      }
    }

    // 2. SPAM DETECTION
    const lowerText = textToModerate.toLowerCase();
    const spamMatches = MODERATION_CONFIG.spam_keywords.filter(keyword => 
      lowerText.includes(keyword)
    );
    if (spamMatches.length >= 2) {
      flags.push({
        type: 'spam_detection',
        matches: spamMatches,
        severity: 'medium'
      });
      confidence = Math.max(confidence, 0.6);
    }

    // 3. PIRACY DETECTION
    const piracyMatches = MODERATION_CONFIG.piracy_keywords.filter(keyword =>
      lowerText.includes(keyword)
    );
    if (piracyMatches.length >= 1) {
      flags.push({
        type: 'piracy_detection',
        matches: piracyMatches,
        severity: 'high'
      });
      actionTaken = actionTaken === 'none' ? 'flag' : actionTaken;
      confidence = Math.max(confidence, 0.8);
    }

    // 4. FILE TYPE CHECKS
    if (filename) {
      const suspiciousExt = MODERATION_CONFIG.suspicious_file_types.find(ext =>
        filename.toLowerCase().endsWith(ext)
      );
      if (suspiciousExt) {
        flags.push({
          type: 'suspicious_file_type',
          extension: suspiciousExt,
          severity: 'critical'
        });
        actionTaken = 'block';
        confidence = 0.95;
      }
    }

    // 5. DETERMINE ACTION
    if (actionTaken === 'none' && flags.length > 0) {
      const criticalFlags = flags.filter(f => f.severity === 'critical');
      const highFlags = flags.filter(f => f.severity === 'high');
      
      if (criticalFlags.length > 0) {
        actionTaken = 'block';
      } else if (highFlags.length >= 2) {
        actionTaken = 'flag';
      } else if (flags.length >= 3) {
        actionTaken = 'flag';
      }
    }

    // 6. LOG TO DATABASE
    if (flags.length > 0) {
      await supabase.from('moderation_logs').insert({
        user_id: userId,
        content_url: contentUrl,
        content_type: contentType,
        title: title,
        description: description,
        flags: flags,
        action_taken: actionTaken,
        confidence: confidence,
        auto_flagged: true,
        flagged_at: new Date().toISOString()
      });
    }

    // 7. TAKE ACTION
    if (actionTaken === 'ban') {
      // Ban user immediately
      await supabase.from('users').update({
        banned: true,
        ban_reason: 'Automated CSAM detection',
        banned_at: new Date().toISOString()
      }).eq('id', userId);

      return res.status(403).json({
        allowed: false,
        action: 'banned',
        reason: 'Content violates terms of service',
        permanent: true
      });
    }

    if (actionTaken === 'block') {
      return res.status(403).json({
        allowed: false,
        action: 'blocked',
        reason: 'Content flagged as suspicious',
        flags: flags,
        confidence: confidence
      });
    }

    // Allow upload but flag for review if suspicious
    res.json({
      allowed: true,
      flagged: flags.length > 0,
      action: actionTaken,
      flags: flags,
      confidence: confidence,
      message: actionTaken === 'flag' 
        ? 'Upload allowed but flagged for review' 
        : 'Upload approved'
    });

  } catch (error) {
    console.error('Auto-moderation error:', error);
    // Fail open - allow upload if moderation system fails
    res.json({
      allowed: true,
      flagged: false,
      error: 'Moderation system error',
      message: 'Upload approved (system error)'
    });
  }
});

/**
 * Get moderation stats for admin dashboard
 * GET /api/moderation/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('moderation_logs')
      .select('*')
      .order('flagged_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const stats = {
      total_flags: logs.length,
      blocked: logs.filter(l => l.action_taken === 'block').length,
      flagged: logs.filter(l => l.action_taken === 'flag').length,
      banned: logs.filter(l => l.action_taken === 'ban').length,
      by_category: {},
      recent: logs.slice(0, 10)
    };

    // Count by category
    logs.forEach(log => {
      log.flags?.forEach(flag => {
        const category = flag.category || flag.type;
        stats.by_category[category] = (stats.by_category[category] || 0) + 1;
      });
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * Batch moderate multiple uploads
 * POST /api/moderation/batch
 */
router.post('/batch', async (req, res) => {
  try {
    const { uploads } = req.body; // Array of upload objects

    if (!Array.isArray(uploads)) {
      return res.status(400).json({ error: 'uploads must be an array' });
    }

    const results = [];

    for (const upload of uploads) {
      // Call auto-flag for each upload
      const response = await fetch(`${req.protocol}://${req.get('host')}/api/moderation/auto-flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(upload)
      });

      const result = await response.json();
      results.push({
        ...upload,
        moderation: result
      });
    }

    res.json({
      total: uploads.length,
      allowed: results.filter(r => r.moderation.allowed).length,
      blocked: results.filter(r => !r.moderation.allowed).length,
      flagged: results.filter(r => r.moderation.flagged).length,
      results
    });
  } catch (error) {
    console.error('Batch moderation error:', error);
    res.status(500).json({ error: 'Batch moderation failed' });
  }
});

module.exports = router;

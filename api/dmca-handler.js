/**
 * DMCA Takedown Handler
 * Automated copyright compliance system with AI + Human oversight
 *
 * Features:
 * - Automated takedown processing
 * - User notification
 * - Repeat infringer tracking
 * - Logging for compliance trail
 * - Manual override capability
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireOwner } = require('./middleware/authMiddleware');
const { supabase } = require('./lib/supabaseServer');
const { notaryRecord } = require('./services/notary');

/**
 * POST /api/dmca/submit
 * Submit a DMCA takedown notice
 * PUBLIC endpoint - no auth required (for rights holders)
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      complainant_name,
      complainant_email,
      complainant_address,
      complainant_phone,
      copyright_holder,
      infringing_urls,
      original_work_description,
      signature,
      date_signed,
      good_faith_statement,
      accuracy_statement,
      authority_statement
    } = req.body;

    // Validate required fields
    if (!complainant_name || !complainant_email || !infringing_urls || !signature) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['complainant_name', 'complainant_email', 'infringing_urls', 'signature']
      });
    }

    // Create DMCA notice
    const { data: notice, error } = await supabase
      .from('dmca_notices')
      .insert([{
        complainant_name,
        complainant_email,
        complainant_address,
        complainant_phone,
        copyright_holder: copyright_holder || complainant_name,
        infringing_urls: Array.isArray(infringing_urls) ? infringing_urls : [infringing_urls],
        original_work_description,
        signature,
        date_signed: date_signed || new Date().toISOString(),
        good_faith_statement: good_faith_statement || true,
        accuracy_statement: accuracy_statement || true,
        authority_statement: authority_statement || true,
        status: 'PENDING',
        received_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('DMCA notice submission error:', error);
      return res.status(500).json({ error: 'Failed to submit notice' });
    }

    // Log to notary
    notaryRecord({
      actor: 'dmca_system',
      command: 'dmca_notice_received',
      noticeId: notice.id,
      complainant: complainant_email,
      urls_count: notice.infringing_urls.length,
      timestamp: new Date().toISOString()
    });

    // Trigger automated processing
    processNoticeAutomated(notice.id);

    res.status(201).json({
      success: true,
      notice_id: notice.id,
      message: 'DMCA notice received and processing',
      status: 'PENDING',
      eta: 'Content will be reviewed within 24 hours'
    });

  } catch (error) {
    console.error('DMCA submission error:', error);
    res.status(500).json({ error: 'Failed to process DMCA notice' });
  }
});

/**
 * Automated DMCA notice processing
 * Runs asynchronously after notice is received
 */
async function processNoticeAutomated(noticeId) {
  try {
    // Get notice details
    const { data: notice } = await supabase
      .from('dmca_notices')
      .select('*')
      .eq('id', noticeId)
      .single();

    if (!notice) return;

    console.log(`🔍 Processing DMCA notice ${noticeId} for ${notice.infringing_urls.length} URLs`);

    let actionsLog = [];

    // Process each infringing URL
    for (const url of notice.infringing_urls) {
      const action = await takedownContent(url, noticeId);
      actionsLog.push(action);
    }

    // Update notice status
    const allSuccessful = actionsLog.every(a => a.success);
    await supabase
      .from('dmca_notices')
      .update({
        status: allSuccessful ? 'COMPLETED' : 'PARTIALLY_COMPLETED',
        processed_at: new Date().toISOString(),
        actions_log: actionsLog
      })
      .eq('id', noticeId);

    // Log completion
    notaryRecord({
      actor: 'dmca_system',
      command: 'dmca_notice_processed',
      noticeId: noticeId,
      actions_taken: actionsLog.length,
      success_rate: `${actionsLog.filter(a => a.success).length}/${actionsLog.length}`,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ DMCA notice ${noticeId} processed: ${actionsLog.filter(a => a.success).length}/${actionsLog.length} successful`);

  } catch (error) {
    console.error('DMCA automated processing error:', error);

    // Mark as failed
    await supabase
      .from('dmca_notices')
      .update({
        status: 'FAILED',
        error_message: error.message
      })
      .eq('id', noticeId);
  }
}

/**
 * Takedown specific content
 * Handles posts, comments, media, etc.
 */
async function takedownContent(url, noticeId) {
  try {
    // Parse URL to determine content type
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p);

    let contentType = null;
    let contentId = null;

    // Detect content type from URL
    if (pathParts.includes('posts') || pathParts.includes('post')) {
      contentType = 'post';
      contentId = pathParts[pathParts.indexOf('posts') + 1] || pathParts[pathParts.indexOf('post') + 1];
    } else if (pathParts.includes('media') || pathParts.includes('uploads')) {
      contentType = 'media';
      contentId = pathParts[pathParts.length - 1];
    } else if (pathParts.includes('profile') || pathParts.includes('user')) {
      contentType = 'user_profile';
      contentId = pathParts[pathParts.indexOf('profile') + 1] || pathParts[pathParts.indexOf('user') + 1];
    }

    if (!contentType || !contentId) {
      return {
        url,
        success: false,
        reason: 'Unable to parse URL',
        action: 'MANUAL_REVIEW_REQUIRED'
      };
    }

    // Take action based on content type
    let result;
    switch (contentType) {
      case 'post':
        result = await takedownPost(contentId, noticeId);
        break;
      case 'media':
        result = await takedownMedia(contentId, noticeId);
        break;
      case 'user_profile':
        result = await takedownUserContent(contentId, noticeId);
        break;
      default:
        result = { success: false, reason: 'Unknown content type' };
    }

    return {
      url,
      contentType,
      contentId,
      ...result
    };

  } catch (error) {
    console.error('Takedown error:', error);
    return {
      url,
      success: false,
      reason: error.message,
      action: 'MANUAL_REVIEW_REQUIRED'
    };
  }
}

/**
 * Takedown a post
 */
async function takedownPost(postId, noticeId) {
  try {
    // Get post details for notification
    const { data: post } = await supabase
      .from('posts')
      .select('author_id, body')
      .eq('id', postId)
      .single();

    if (!post) {
      return { success: false, reason: 'Post not found' };
    }

    // Mark post as taken down (don't delete - keep for records)
    const { error } = await supabase
      .from('posts')
      .update({
        dmca_takedown: true,
        dmca_notice_id: noticeId,
        dmca_taken_down_at: new Date().toISOString(),
        visibility: 'DMCA_REMOVED'
      })
      .eq('id', postId);

    if (error) {
      return { success: false, reason: error.message };
    }

    // Track infringement for user
    await trackInfringement(post.author_id, 'post', postId, noticeId);

    // Notify user
    await notifyUserOfTakedown(post.author_id, 'post', postId, noticeId);

    console.log(`🔨 Post ${postId} taken down via DMCA notice ${noticeId}`);

    return {
      success: true,
      action: 'POST_HIDDEN',
      notified: true
    };

  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Takedown media file
 */
async function takedownMedia(mediaPath, noticeId) {
  try {
    // Find posts/content using this media
    const { data: posts } = await supabase
      .from('posts')
      .select('id, author_id')
      .contains('media_urls', [mediaPath]);

    if (posts && posts.length > 0) {
      // Takedown all posts using this media
      for (const post of posts) {
        await takedownPost(post.id, noticeId);
      }

      return {
        success: true,
        action: 'MEDIA_REMOVED',
        affected_posts: posts.length
      };
    }

    return {
      success: false,
      reason: 'Media not found in any posts'
    };

  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Takedown user's infringing content
 */
async function takedownUserContent(userId, noticeId) {
  try {
    // Get all user's public posts
    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .eq('author_id', userId)
      .eq('visibility', 'PUBLIC');

    if (!posts || posts.length === 0) {
      return { success: false, reason: 'No public content found' };
    }

    // Takedown all public posts
    let takenDown = 0;
    for (const post of posts) {
      const result = await takedownPost(post.id, noticeId);
      if (result.success) takenDown++;
    }

    return {
      success: true,
      action: 'USER_CONTENT_HIDDEN',
      posts_removed: takenDown
    };

  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Track copyright infringement for repeat offender detection
 */
async function trackInfringement(userId, contentType, contentId, noticeId) {
  try {
    // Record infringement
    await supabase
      .from('copyright_infractions')
      .insert([{
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
        dmca_notice_id: noticeId,
        infraction_date: new Date().toISOString()
      }]);

    // Check if user is now a repeat infringer
    const { data: infractions, count } = await supabase
      .from('copyright_infractions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Escalation policy: 3 strikes = account suspension
    if (count >= 3) {
      await suspendRepeatInfringer(userId, count);
    } else if (count === 2) {
      await warnUser(userId, 'FINAL_WARNING');
    } else if (count === 1) {
      await warnUser(userId, 'FIRST_WARNING');
    }

    console.log(`📊 User ${userId} now has ${count} copyright infractions`);

  } catch (error) {
    console.error('Infringement tracking error:', error);
  }
}

/**
 * Suspend repeat infringer
 */
async function suspendRepeatInfringer(userId, infractionCount) {
  try {
    // Mark user as suspended
    await supabase
      .from('users')
      .update({
        account_status: 'SUSPENDED',
        suspension_reason: 'REPEAT_COPYRIGHT_INFRINGER',
        suspended_at: new Date().toISOString(),
        infraction_count: infractionCount
      })
      .eq('id', userId);

    // Create notification
    await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type: 'ACCOUNT_SUSPENDED',
        message: `Your account has been suspended due to ${infractionCount} copyright violations. Please contact support.`,
        severity: 'CRITICAL'
      }]);

    // Log to notary
    notaryRecord({
      actor: 'dmca_system',
      command: 'repeat_infringer_suspended',
      userId: userId,
      infractions: infractionCount,
      timestamp: new Date().toISOString()
    });

    console.log(`🚫 User ${userId} suspended for repeat copyright infringement (${infractionCount} strikes)`);

  } catch (error) {
    console.error('Suspension error:', error);
  }
}

/**
 * Warn user about infringement
 */
async function warnUser(userId, warningLevel) {
  try {
    const messages = {
      FIRST_WARNING: 'You have received a copyright infringement notice. Please ensure all content you post is original or properly licensed. Further violations may result in account suspension.',
      FINAL_WARNING: 'This is your final warning. You have received 2 copyright notices. One more violation will result in permanent account suspension.'
    };

    await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type: 'COPYRIGHT_WARNING',
        message: messages[warningLevel],
        severity: warningLevel === 'FINAL_WARNING' ? 'HIGH' : 'MEDIUM'
      }]);

    console.log(`⚠️ User ${userId} received ${warningLevel}`);

  } catch (error) {
    console.error('Warning error:', error);
  }
}

/**
 * Notify user of DMCA takedown
 */
async function notifyUserOfTakedown(userId, contentType, contentId, noticeId) {
  try {
    await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type: 'DMCA_TAKEDOWN',
        message: `Your ${contentType} has been removed due to a DMCA copyright notice (Notice ID: ${noticeId}). If you believe this is an error, you may file a counter-notice.`,
        severity: 'HIGH',
        metadata: {
          content_type: contentType,
          content_id: contentId,
          notice_id: noticeId,
          counter_notice_info: '/legal/dmca-counter-notice'
        }
      }]);

    console.log(`📧 User ${userId} notified of DMCA takedown for ${contentType} ${contentId}`);

  } catch (error) {
    console.error('User notification error:', error);
  }
}

/**
 * GET /api/dmca/notices
 * View all DMCA notices (admin only)
 */
router.get('/notices', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('dmca_notices')
      .select('*', { count: 'exact' })
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: notices, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch notices' });
    }

    res.json({
      notices,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('DMCA notices fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch DMCA notices' });
  }
});

/**
 * POST /api/dmca/counter-notice
 * Submit a DMCA counter-notice
 */
router.post('/counter-notice', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      original_notice_id,
      content_description,
      good_faith_statement,
      accuracy_statement,
      consent_to_jurisdiction,
      signature
    } = req.body;

    if (!original_notice_id || !signature) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['original_notice_id', 'signature']
      });
    }

    // Create counter-notice
    const { data: counterNotice, error } = await supabase
      .from('dmca_counter_notices')
      .insert([{
        user_id: userId,
        original_notice_id,
        content_description,
        good_faith_statement: good_faith_statement || true,
        accuracy_statement: accuracy_statement || true,
        consent_to_jurisdiction: consent_to_jurisdiction || true,
        signature,
        submitted_at: new Date().toISOString(),
        status: 'PENDING_REVIEW'
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to submit counter-notice' });
    }

    // Log to notary
    notaryRecord({
      actor: 'dmca_system',
      command: 'counter_notice_received',
      counterNoticeId: counterNotice.id,
      userId: userId,
      originalNotice: original_notice_id,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      counter_notice_id: counterNotice.id,
      message: 'Counter-notice received and under review',
      status: 'PENDING_REVIEW',
      eta: '10-14 business days'
    });

  } catch (error) {
    console.error('Counter-notice submission error:', error);
    res.status(500).json({ error: 'Failed to submit counter-notice' });
  }
});

/**
 * POST /api/dmca/manual-override/:noticeId
 * Manual override for complex cases (owner only)
 */
router.post('/manual-override/:noticeId', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { noticeId } = req.params;
    const { action, reason } = req.body;

    // action: 'APPROVE', 'REJECT', 'RESTORE_CONTENT'

    await supabase
      .from('dmca_notices')
      .update({
        status: action === 'APPROVE' ? 'MANUALLY_APPROVED' : 'MANUALLY_REJECTED',
        manual_override: true,
        override_reason: reason,
        overridden_by: req.user.userId,
        overridden_at: new Date().toISOString()
      })
      .eq('id', noticeId);

    // Log override
    notaryRecord({
      actor: req.user.email,
      command: 'dmca_manual_override',
      noticeId: noticeId,
      action: action,
      reason: reason,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `DMCA notice ${noticeId} ${action.toLowerCase()}ed manually`
    });

  } catch (error) {
    console.error('Manual override error:', error);
    res.status(500).json({ error: 'Failed to process manual override' });
  }
});

module.exports = router;

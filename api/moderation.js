const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware to verify moderator/admin access
const requireModerator = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is moderator or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['moderator', 'admin'].includes(profile.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.user = user;
    req.userRole = profile.role;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get all reports
router.get('/reports', requireModerator, async (req, res) => {
  try {
    const { status, severity, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('user_reports')
      .select('*, reported_user:profiles!reported_user_id(*), reporter:profiles!reporter_id(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      reports: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Create a new report
router.post('/reports', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { reported_user_id, content_id, reason, description, severity } = req.body;

    if (!reported_user_id || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('user_reports')
      .insert({
        reporter_id: user.id,
        reported_user_id,
        content_id,
        reason,
        description,
        severity: severity || 'medium',
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ report: data });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Update report status
router.patch('/reports/:id', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const { data, error } = await supabase
      .from('user_reports')
      .update({
        status,
        notes,
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ report: data });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Get moderation queue (flagged content)
router.get('/queue', requireModerator, async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('moderation_queue')
      .select('*, user:profiles!user_id(*)', { count: 'exact' })
      .eq('status', 'pending')
      .order('flagged_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('content_type', type);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      queue: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
});

// Take action on flagged content
router.post('/queue/:id/action', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve', 'remove', 'review'

    const { data, error } = await supabase
      .from('moderation_queue')
      .update({
        status: action === 'approve' ? 'approved' : action === 'remove' ? 'removed' : 'reviewing',
        action_taken: action,
        action_reason: reason,
        actioned_by: req.user.id,
        actioned_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ item: data });
  } catch (error) {
    console.error('Error taking action:', error);
    res.status(500).json({ error: 'Failed to take action' });
  }
});

// Get banned users
router.get('/bans', requireModerator, async (req, res) => {
  try {
    const { active_only, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('banned_users')
      .select('*, user:profiles!user_id(*), banned_by_user:profiles!banned_by(*)', { count: 'exact' })
      .order('banned_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (active_only === 'true') {
      query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      bans: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bans:', error);
    res.status(500).json({ error: 'Failed to fetch bans' });
  }
});

// Ban a user
router.post('/bans', requireModerator, async (req, res) => {
  try {
    const { user_id, reason, duration_days, permanent } = req.body;

    if (!user_id || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expires_at = permanent ? null : new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('banned_users')
      .insert({
        user_id,
        reason,
        banned_by: req.user.id,
        expires_at,
        permanent: permanent || false
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ ban: data });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// Unban a user
router.delete('/bans/:id', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('banned_users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

// Get auto-moderation rules
router.get('/rules', requireModerator, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('auto_mod_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ rules: data });
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

// Update auto-moderation rule
router.patch('/rules/:id', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled, action } = req.body;

    const { data, error } = await supabase
      .from('auto_mod_rules')
      .update({ enabled, action })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ rule: data });
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({ error: 'Failed to update rule' });
  }
});

// Get moderation stats
router.get('/stats', requireModerator, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const daysAgo = parseInt(timeframe) || 30;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    const [reportsCount, queueCount, bansCount, actionsCount] = await Promise.all([
      supabase.from('user_reports').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
      supabase.from('moderation_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('banned_users').select('*', { count: 'exact', head: true }).gte('banned_at', startDate),
      supabase.from('moderation_queue').select('*', { count: 'exact', head: true }).gte('actioned_at', startDate).neq('status', 'pending')
    ]);

    res.json({
      stats: {
        total_reports: reportsCount.count || 0,
        pending_queue: queueCount.count || 0,
        total_bans: bansCount.count || 0,
        actions_taken: actionsCount.count || 0,
        timeframe: `${daysAgo} days`
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;

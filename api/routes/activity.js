const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const supabase = require('../../lib/supabaseClient');

/**
 * GET /api/activity/stream
 * Server-Sent Events (SSE) endpoint for real-time activity updates
 */
router.get('/stream', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx

  // Send initial connection event
  res.write('data: {"type":"connected","message":"Activity stream connected"}\n\n');

  // Set up Supabase real-time subscription
  const channel = supabase
    .channel(`activity:${userId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'activities',
        filter: `user_id=eq.${userId}`
      }, 
      (payload) => {
        // Send activity update to client
        const activity = payload.new;
        res.write(`data: ${JSON.stringify(activity)}\n\n`);
      }
    )
    .subscribe();

  // Keep connection alive with heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    supabase.removeChannel(channel);
    res.end();
  });
});

/**
 * GET /api/activity/recent
 * Get recent activities (polling fallback)
 */
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, since } = req.query;

    let query = supabase
      .from('activities')
      .select(`
        *,
        user:users!activities_actor_id_fkey(id, username, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by timestamp if provided
    if (since) {
      query = query.gt('created_at', since);
    }

    const { data: activities, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      activities: activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        user: {
          id: activity.user.id,
          name: activity.user.username,
          avatar: activity.user.avatar_url
        },
        target: {
          type: activity.target_type,
          id: activity.target_id,
          title: activity.target_title,
          postId: activity.post_id
        },
        data: activity.metadata || {},
        timestamp: activity.created_at
      }))
    });

  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch recent activities' 
    });
  }
});

/**
 * POST /api/activity/create
 * Create a new activity (internal use by other endpoints)
 */
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { 
      type, 
      userId, 
      actorId, 
      targetType, 
      targetId, 
      targetTitle, 
      postId,
      metadata 
    } = req.body;

    const { data: activity, error } = await supabase
      .from('activities')
      .insert({
        type,
        user_id: userId,
        actor_id: actorId,
        target_type: targetType,
        target_id: targetId,
        target_title: targetTitle,
        post_id: postId,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      activity
    });

  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create activity' 
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get user's recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get recent posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (postsError) throw postsError;

    // Get recent comments
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (commentsError) throw commentsError;

    // Format activities
    const activities = [
      ...(posts || []).map(p => ({
        type: 'post',
        content: p.content,
        timestamp: p.created_at
      })),
      ...(comments || []).map(c => ({
        type: 'comment',
        content: c.content,
        timestamp: c.created_at
      }))
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json({ activities });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity', activities: [] });
  }
});

module.exports = router;

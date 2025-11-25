/**
 * Notifications API
 * Fully integrated with Supabase
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { supabase } = require('../lib/supabaseServer');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { unreadOnly } = req.query;
    let query = supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    if (unreadOnly === 'true') query = query.is('read_at', null);
    const { data } = await query;
    res.json({ notifications: data || [], count: data ? data.length : 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', req.user.userId).is('read_at', null);
    res.json({ unreadCount: count || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

router.post('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', req.params.notificationId).eq('user_id', req.user.userId).is('read_at', null);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

router.post('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', req.user.userId).is('read_at', null);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    await supabase.from('notifications').delete().eq('id', req.params.notificationId).eq('user_id', req.user.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;

/**
 * Notifications API - User Notifications
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// Mock database
let notifications = [];
let notificationIdCounter = 1;

/**
 * GET /api/notifications
 * Get all notifications for user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    // TODO: Get from Supabase
    // const { data, error } = await supabase
    //   .from('notifications')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false })
    //   .range(offset, offset + limit - 1);

    let userNotifications = notifications
      .filter(n => n.userId === userId);

    if (unreadOnly === 'true') {
      userNotifications = userNotifications.filter(n => !n.readAt);
    }

    userNotifications = userNotifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(offset, offset + limit);

    res.json({
      notifications: userNotifications,
      hasMore: offset + limit < userNotifications.length,
      total: userNotifications.length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const unreadCount = notifications.filter(n =>
      n.userId === userId && !n.readAt
    ).length;

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

/**
 * POST /api/notifications/:notificationId/read
 * Mark notification as read
 */
router.post('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { notificationId } = req.params;

    const notification = notifications.find(n =>
      n.id === parseInt(notificationId) && n.userId === userId
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.readAt = new Date().toISOString();

    // TODO: Update in Supabase
    // await supabase
    //   .from('notifications')
    //   .update({ read_at: new Date().toISOString() })
    //   .eq('id', notificationId)
    //   .eq('user_id', userId);

    res.json({
      success: true,
      readAt: notification.readAt
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read
 */
router.post('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const now = new Date().toISOString();

    notifications
      .filter(n => n.userId === userId && !n.readAt)
      .forEach(n => n.readAt = now);

    // TODO: Update in Supabase
    // await supabase
    //   .from('notifications')
    //   .update({ read_at: now })
    //   .eq('user_id', userId)
    //   .is('read_at', null);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification
 */
router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { notificationId } = req.params;

    const notificationIndex = notifications.findIndex(n =>
      n.id === parseInt(notificationId) && n.userId === userId
    );

    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notifications.splice(notificationIndex, 1);

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

/**
 * POST /api/notifications/create
 * Create a notification (internal use)
 * Call this from other routes when events happen
 */
function createNotification(userId, type, title, body, actionUrl = null) {
  const notification = {
    id: notificationIdCounter++,
    userId,
    type, // 'like', 'comment', 'follow', 'friend_request', 'message', etc.
    title,
    body,
    actionUrl,
    createdAt: new Date().toISOString(),
    readAt: null
  };

  notifications.push(notification);

  // TODO: Insert into Supabase
  // await supabase.from('notifications').insert([{
  //   user_id: userId,
  //   type, title, body, action_url: actionUrl
  // }]);

  console.log(`🔔 Notification created for user ${userId}: ${title}`);

  return notification;
}

// Export helper function for use in other routes
router.createNotification = createNotification;

module.exports = router;

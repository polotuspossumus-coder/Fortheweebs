/**
 * Messages API - Direct Messaging
 * Fully integrated with Supabase
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { supabase } = require('../lib/supabaseServer');

router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { data: participations } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', userId);
    if (!participations || participations.length === 0) return res.json({ conversations: [], count: 0 });
    const conversationIds = participations.map(p => p.conversation_id);
    const { data: conversations } = await supabase.from('conversations').select('*').in('id', conversationIds).order('updated_at', { ascending: false });
    res.json({ conversations: conversations || [], count: conversations ? conversations.length : 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

router.get('/conversation/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const { data: participation } = await supabase.from('conversation_participants').select('*').eq('conversation_id', conversationId).eq('user_id', userId).single();
    if (!participation) return res.status(403).json({ error: 'Not a participant' });
    const { data } = await supabase.from('messages').select('*, sender:users(id, email, display_name, avatar_url)').eq('conversation_id', conversationId).order('created_at', { ascending: true }).range(offset, offset + parseInt(limit) - 1);
    res.json({ messages: data || [], hasMore: data && data.length === parseInt(limit), total: data ? data.length : 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { recipientId, body, conversationId, mediaUrls } = req.body;
    if (!body || body.trim().length === 0) return res.status(400).json({ error: 'Message body required' });
    let targetConversationId = conversationId;
    if (!targetConversationId && recipientId) {
      const { data: newConvo } = await supabase.from('conversations').insert([{}]).select().single();
      await supabase.from('conversation_participants').insert([{ conversation_id: newConvo.id, user_id: userId }, { conversation_id: newConvo.id, user_id: recipientId }]);
      targetConversationId = newConvo.id;
    }
    const { data } = await supabase.from('messages').insert([{ conversation_id: targetConversationId, sender_id: userId, body, media_urls: mediaUrls || [] }]).select('*, sender:users(id, email, display_name, avatar_url)').single();
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', targetConversationId);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.post('/:messageId/read', authenticateToken, async (req, res) => {
  try {
    await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', req.params.messageId).is('read_at', null);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    await supabase.from('messages').delete().eq('id', req.params.messageId).eq('sender_id', req.user.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { data: participations } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', userId);
    if (!participations || participations.length === 0) return res.json({ unreadCount: 0 });
    const conversationIds = participations.map(p => p.conversation_id);
    const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).in('conversation_id', conversationIds).neq('sender_id', userId).is('read_at', null);
    res.json({ unreadCount: count || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router;

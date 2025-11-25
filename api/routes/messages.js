/**
 * Messages API - Direct Messaging
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// Mock database
let messages = [];
let conversations = [];
let messageIdCounter = 1;
let conversationIdCounter = 1;

/**
 * GET /api/messages/conversations
 * Get all conversations for a user
 */
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // TODO: Get from Supabase
    // const { data, error } = await supabase
    //   .from('conversations')
    //   .select('*, participants:conversation_participants(*), last_message:messages(*)')
    //   .contains('participant_ids', [userId])
    //   .order('updated_at', { ascending: false });

    const userConversations = conversations
      .filter(c => c.participants.includes(userId))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({
      conversations: userConversations,
      count: userConversations.length
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

/**
 * GET /api/messages/conversation/:conversationId
 * Get all messages in a conversation
 */
router.get('/conversation/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const conversation = conversations.find(c => c.id === parseInt(conversationId));

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ error: 'You are not a participant in this conversation' });
    }

    // TODO: Get from Supabase
    const conversationMessages = messages
      .filter(m => m.conversationId === parseInt(conversationId))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(offset, offset + limit);

    res.json({
      messages: conversationMessages,
      hasMore: offset + limit < conversationMessages.length,
      total: conversationMessages.length
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

/**
 * POST /api/messages/send
 * Send a message
 */
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { userId, email } = req.user;
    const { recipientId, body, conversationId, mediaUrls } = req.body;

    if (!body || body.trim().length === 0) {
      return res.status(400).json({ error: 'Message body is required' });
    }

    if (body.length > 5000) {
      return res.status(400).json({ error: 'Message too long (max 5000 characters)' });
    }

    let targetConversationId = conversationId;

    // Create new conversation if needed
    if (!targetConversationId && recipientId) {
      // Check if conversation already exists
      const existingConversation = conversations.find(c =>
        c.participants.length === 2 &&
        c.participants.includes(userId) &&
        c.participants.includes(recipientId)
      );

      if (existingConversation) {
        targetConversationId = existingConversation.id;
      } else {
        // Create new conversation
        const newConversation = {
          id: conversationIdCounter++,
          participants: [userId, recipientId],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        conversations.push(newConversation);
        targetConversationId = newConversation.id;

        console.log(`💬 New conversation ${targetConversationId} created between ${userId} and ${recipientId}`);
      }
    }

    if (!targetConversationId) {
      return res.status(400).json({ error: 'Conversation ID or recipient ID is required' });
    }

    const newMessage = {
      id: messageIdCounter++,
      conversationId: targetConversationId,
      senderId: userId,
      sender: {
        id: userId,
        email,
        displayName: req.user.displayName || email.split('@')[0],
        avatar: '👤'
      },
      body,
      mediaUrls: mediaUrls || [],
      createdAt: new Date().toISOString(),
      readAt: null
    };

    // TODO: Insert into Supabase
    // const { data, error } = await supabase
    //   .from('messages')
    //   .insert([{
    //     conversation_id: targetConversationId,
    //     sender_id: userId,
    //     body,
    //     media_urls: mediaUrls
    //   }])
    //   .select()
    //   .single();

    messages.push(newMessage);

    // Update conversation timestamp
    const conversation = conversations.find(c => c.id === targetConversationId);
    if (conversation) {
      conversation.updatedAt = new Date().toISOString();
      conversation.lastMessage = body.substring(0, 100);
    }

    console.log(`💬 Message sent in conversation ${targetConversationId} by ${email}`);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * POST /api/messages/:messageId/read
 * Mark a message as read
 */
router.post('/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { messageId } = req.params;

    const message = messages.find(m => m.id === parseInt(messageId));

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only recipient can mark as read
    if (message.senderId === userId) {
      return res.status(400).json({ error: 'Cannot mark your own message as read' });
    }

    message.readAt = new Date().toISOString();

    // TODO: Update in Supabase
    // await supabase
    //   .from('messages')
    //   .update({ read_at: new Date().toISOString() })
    //   .eq('id', messageId);

    console.log(`✅ Message ${messageId} marked as read by user ${userId}`);

    res.json({
      success: true,
      readAt: message.readAt
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

/**
 * DELETE /api/messages/:messageId
 * Delete a message (sender only)
 */
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { messageId } = req.params;

    const messageIndex = messages.findIndex(m => m.id === parseInt(messageId));

    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const message = messages[messageIndex];

    // Only sender can delete
    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    messages.splice(messageIndex, 1);

    console.log(`🗑️ Message ${messageId} deleted by user ${userId}`);

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

/**
 * GET /api/messages/unread-count
 * Get unread message count for user
 */
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // Get all conversations user is in
    const userConversationIds = conversations
      .filter(c => c.participants.includes(userId))
      .map(c => c.id);

    // Count unread messages
    const unreadCount = messages.filter(m =>
      userConversationIds.includes(m.conversationId) &&
      m.senderId !== userId &&
      !m.readAt
    ).length;

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router;

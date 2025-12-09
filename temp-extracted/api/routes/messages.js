/**
 * Messages API Route
 * Handles direct messages between users
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get Conversations
 * GET /api/routes/messages/conversations/:userId
 */
router.get('/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('conversations')
            .select('*, other_user:users!other_user_id(id, username, avatar)')
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        res.json({ conversations: data || [] });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Messages in Conversation
 * GET /api/routes/messages/:conversationId
 */
router.get('/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;

        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:users(id, username, avatar)')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json({ messages: data || [] });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Send Message
 * POST /api/routes/messages
 */
router.post('/', async (req, res) => {
    try {
        const { senderId, recipientId, conversationId, content } = req.body;

        if (!senderId || !recipientId || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create conversation if doesn't exist
        let convId = conversationId;
        if (!convId) {
            const { data: conv, error: convError } = await supabase
                .from('conversations')
                .insert({
                    user1_id: senderId,
                    user2_id: recipientId,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (convError) throw convError;
            convId = conv.id;
        }

        // Insert message
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: convId,
                sender_id: senderId,
                recipient_id: recipientId,
                content: content,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // Update conversation last message time
        await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', convId);

        res.json({ message: data });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

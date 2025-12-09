/**
 * Subscriptions API Route
 * Handles creator monetization subscriptions
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get Creator's Subscription Tiers
 * GET /api/routes/subscriptions/:creatorId
 */
router.get('/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;

        const { data, error } = await supabase
            .from('creator_subscriptions')
            .select('*')
            .eq('creator_id', creatorId)
            .eq('active', true);

        if (error) throw error;

        res.json({ subscriptions: data || [] });
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Subscribe to Creator
 * POST /api/routes/subscriptions/subscribe
 */
router.post('/subscribe', async (req, res) => {
    try {
        const { userId, creatorId, tierId } = req.body;

        if (!userId || !creatorId || !tierId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('user_subscriptions')
            .insert({
                user_id: userId,
                creator_id: creatorId,
                tier_id: tierId,
                status: 'active',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ subscription: data });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Unsubscribe from Creator
 * POST /api/routes/subscriptions/unsubscribe
 */
router.post('/unsubscribe', async (req, res) => {
    try {
        const { userId, creatorId } = req.body;

        if (!userId || !creatorId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { error } = await supabase
            .from('user_subscriptions')
            .update({ status: 'canceled', canceled_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('creator_id', creatorId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

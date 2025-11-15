const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Get User Tier
 * GET /api/user-tier/:userId
 */
router.get('/user/:userId/tier', async (req, res) => {
    try {
        const { userId } = req.params;

        // Owner always has SUPER_ADMIN tier
        if (userId === 'owner') {
            return res.json({
                success: true,
                tier: 'SUPER_ADMIN',
                userId
            });
        }

        // Query Supabase for user tier
        const { data: user, error } = await supabase
            .from('users')
            .select('payment_tier, paid_at')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.json({
                success: true,
                tier: 'FREE',
                userId
            });
        }

        res.json({
            success: true,
            tier: user?.payment_tier || 'FREE',
            paidAt: user?.paid_at,
            userId
        });
    } catch (error) {
        console.error('Get tier error:', error);
        res.json({
            success: true,
            tier: 'FREE',
            userId: req.params.userId
        });
    }
});

/**
 * Update User Tier (after successful payment)
 * POST /api/user-tier/update
 */
router.post('/user-tier/update', async (req, res) => {
    try {
        const { userId, tier } = req.body;

        if (!userId || !tier) {
            return res.status(400).json({
                success: false,
                error: 'userId and tier required'
            });
        }

        const { data, error } = await supabase
            .from('users')
            .update({
                payment_tier: tier,
                paid_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            tier,
            userId,
            data
        });
    } catch (error) {
        console.error('Update tier error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

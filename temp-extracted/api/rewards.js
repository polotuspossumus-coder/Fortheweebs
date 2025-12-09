/**
 * Fan Rewards & Loyalty API
 * Gamification and reward system for active users
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get User Points
 * GET /api/rewards/points/:userId
 */
router.get('/points/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('user_rewards')
            .select('points, level, badges')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json(data || { points: 0, level: 1, badges: [] });
    } catch (error) {
        console.error('Get user points error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Award Points
 * POST /api/rewards/award
 */
router.post('/award', async (req, res) => {
    try {
        const { userId, points, reason } = req.body;

        if (!userId || !points) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get current points
        let { data: userRewards, error: getError } = await supabase
            .from('user_rewards')
            .select('points, level')
            .eq('user_id', userId)
            .single();

        if (getError && getError.code !== 'PGRST116') throw getError;

        const currentPoints = userRewards?.points || 0;
        const newPoints = currentPoints + points;
        const newLevel = Math.floor(newPoints / 100) + 1;

        // Upsert rewards
        const { error: upsertError } = await supabase
            .from('user_rewards')
            .upsert({
                user_id: userId,
                points: newPoints,
                level: newLevel,
                updated_at: new Date().toISOString()
            });

        if (upsertError) throw upsertError;

        // Log transaction
        await supabase
            .from('reward_transactions')
            .insert({
                user_id: userId,
                points: points,
                reason: reason,
                created_at: new Date().toISOString()
            });

        res.json({ points: newPoints, level: newLevel });
    } catch (error) {
        console.error('Award points error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Leaderboard
 * GET /api/rewards/leaderboard
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const { data, error } = await supabase
            .from('user_rewards')
            .select('*, user:users(id, username, avatar)')
            .order('points', { ascending: false })
            .limit(parseInt(limit));

        if (error) throw error;

        res.json({ leaderboard: data || [] });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Award Badge
 * POST /api/rewards/badge
 */
router.post('/badge', async (req, res) => {
    try {
        const { userId, badgeId } = req.body;

        if (!userId || !badgeId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('user_badges')
            .insert({
                user_id: userId,
                badge_id: badgeId,
                earned_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ badge: data });
    } catch (error) {
        console.error('Award badge error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

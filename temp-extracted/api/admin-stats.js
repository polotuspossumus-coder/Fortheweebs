/**
 * Admin Stats & Health API
 * Provides system metrics and health monitoring
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const os = require('os');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get System Health
 * GET /api/admin-stats/health
 */
router.get('/health', (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
        status: 'healthy',
        uptime: uptime,
        memory: {
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
            rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB'
        },
        system: {
            platform: os.platform(),
            cpus: os.cpus().length,
            freeMemory: Math.round(os.freemem() / 1024 / 1024) + ' MB',
            totalMemory: Math.round(os.totalmem() / 1024 / 1024) + ' MB'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * Get User Statistics
 * GET /api/admin-stats/users
 */
router.get('/users', async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('tier, subscription_status');

        if (error) throw error;

        const stats = {
            total: users.length,
            byTier: {},
            byStatus: {}
        };

        users.forEach(user => {
            stats.byTier[user.tier] = (stats.byTier[user.tier] || 0) + 1;
            stats.byStatus[user.subscription_status] = (stats.byStatus[user.subscription_status] || 0) + 1;
        });

        res.json(stats);
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Revenue Statistics
 * GET /api/admin-stats/revenue
 */
router.get('/revenue', async (req, res) => {
    try {
        const tierPrices = {
            elite: 1000,
            vip: 500,
            premium: 250,
            enhanced: 100,
            standard: 50
        };

        const { data: users, error } = await supabase
            .from('users')
            .select('tier, subscription_status')
            .eq('subscription_status', 'active');

        if (error) throw error;

        let totalRevenue = 0;
        const revenueByTier = {};

        users.forEach(user => {
            const price = tierPrices[user.tier] || 0;
            totalRevenue += price;
            revenueByTier[user.tier] = (revenueByTier[user.tier] || 0) + price;
        });

        res.json({
            totalRevenue,
            revenueByTier,
            activeSubscriptions: users.length
        });
    } catch (error) {
        console.error('Get revenue stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Content Statistics
 * GET /api/admin-stats/content
 */
router.get('/content', async (req, res) => {
    try {
        const [postsResult, commentsResult, uploadsResult] = await Promise.all([
            supabase.from('posts').select('id', { count: 'exact', head: true }),
            supabase.from('comments').select('id', { count: 'exact', head: true }),
            supabase.from('uploads').select('id', { count: 'exact', head: true })
        ]);

        res.json({
            posts: postsResult.count || 0,
            comments: commentsResult.count || 0,
            uploads: uploadsResult.count || 0
        });
    } catch (error) {
        console.error('Get content stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Recent Activity
 * GET /api/admin-stats/activity
 */
router.get('/activity', async (req, res) => {
    try {
        const { data: recentUsers, error } = await supabase
            .from('users')
            .select('id, username, created_at, tier')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        res.json({ recentUsers });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

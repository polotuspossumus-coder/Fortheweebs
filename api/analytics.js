/**
 * Creator Analytics API
 * Advanced analytics for content creators
 * Provides detailed metrics, charts, and platform-wide statistics
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get Creator Analytics Dashboard
 * GET /api/analytics/:creatorId
 */
router.get('/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;
        const { timeRange = '30d' } = req.query;

        // Calculate date range
        const now = new Date();
        const startDate = new Date(now);
        
        switch(timeRange) {
            case '7d': startDate.setDate(now.getDate() - 7); break;
            case '30d': startDate.setDate(now.getDate() - 30); break;
            case '90d': startDate.setDate(now.getDate() - 90); break;
            case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
            default: startDate.setDate(now.getDate() - 30);
        }

        // Get various metrics
        const [views, earnings, subscribers, content, engagement] = await Promise.all([
            // Total views
            supabase.from('content_views')
                .select('id', { count: 'exact', head: true })
                .eq('creator_id', creatorId)
                .gte('created_at', startDate.toISOString()),
            
            // Earnings
            supabase.from('earnings')
                .select('amount, created_at')
                .eq('creator_id', creatorId)
                .gte('created_at', startDate.toISOString()),
            
            // Active subscribers
            supabase.from('subscriptions')
                .select('id', { count: 'exact', head: true })
                .eq('creator_id', creatorId)
                .eq('status', 'active'),
            
            // Content count
            supabase.from('content')
                .select('id, type', { count: 'exact' })
                .eq('creator_id', creatorId),
            
            // Engagement (likes, comments, shares)
            supabase.from('engagement_metrics')
                .select('likes, comments, shares')
                .eq('creator_id', creatorId)
                .gte('created_at', startDate.toISOString())
        ]);

        const totalEarnings = earnings.data?.reduce((sum, e) => sum + e.amount, 0) || 0;
        const totalLikes = engagement.data?.reduce((sum, e) => sum + (e.likes || 0), 0) || 0;
        const totalComments = engagement.data?.reduce((sum, e) => sum + (e.comments || 0), 0) || 0;
        const totalShares = engagement.data?.reduce((sum, e) => sum + (e.shares || 0), 0) || 0;

        // Content breakdown
        const contentByType = {};
        content.data?.forEach(c => {
            contentByType[c.type] = (contentByType[c.type] || 0) + 1;
        });

        res.json({
            summary: {
                views: views.count || 0,
                earnings: totalEarnings,
                subscribers: subscribers.count || 0,
                contentPieces: content.count || 0,
                likes: totalLikes,
                comments: totalComments,
                shares: totalShares,
                engagementRate: ((totalLikes + totalComments + totalShares) / (views.count || 1) * 100).toFixed(2)
            },
            contentBreakdown: contentByType,
            timeRange,
            periodStart: startDate.toISOString(),
            periodEnd: now.toISOString()
        });

    } catch (error) {
        console.error('Get creator analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Time Series Data for Charts
 * GET /api/analytics/:creatorId/timeseries
 */
router.get('/:creatorId/timeseries', async (req, res) => {
    try {
        const { creatorId } = req.params;
        const { metric = 'views', timeRange = '30d', granularity = 'day' } = req.query;

        const now = new Date();
        const startDate = new Date(now);
        
        switch(timeRange) {
            case '7d': startDate.setDate(now.getDate() - 7); break;
            case '30d': startDate.setDate(now.getDate() - 30); break;
            case '90d': startDate.setDate(now.getDate() - 90); break;
            case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
        }

        // Get data based on metric
        let tableName, column;
        switch(metric) {
            case 'views': tableName = 'content_views'; column = 'created_at'; break;
            case 'earnings': tableName = 'earnings'; column = 'created_at'; break;
            case 'subscribers': tableName = 'subscriptions'; column = 'created_at'; break;
            default: tableName = 'content_views'; column = 'created_at';
        }

        const { data, error } = await supabase
            .from(tableName)
            .select(metric === 'earnings' ? 'amount, created_at' : 'created_at')
            .eq('creator_id', creatorId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Group data by time period
        const timeSeriesData = [];
        const groupedData = {};

        data?.forEach(row => {
            const date = new Date(row.created_at);
            const key = granularity === 'day' 
                ? date.toISOString().split('T')[0]
                : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!groupedData[key]) {
                groupedData[key] = { count: 0, value: 0 };
            }
            
            groupedData[key].count++;
            if (metric === 'earnings') {
                groupedData[key].value += row.amount;
            }
        });

        Object.keys(groupedData).sort().forEach(key => {
            timeSeriesData.push({
                timestamp: key,
                value: metric === 'earnings' ? groupedData[key].value : groupedData[key].count
            });
        });

        res.json({
            metric,
            granularity,
            timeRange,
            data: timeSeriesData
        });

    } catch (error) {
        console.error('Time series error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Platform-Wide Statistics (Admin)
 * GET /api/analytics/platform/stats
 */
router.get('/platform/stats', async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;

        const now = new Date();
        const startDate = new Date(now);
        
        switch(timeRange) {
            case '7d': startDate.setDate(now.getDate() - 7); break;
            case '30d': startDate.setDate(now.getDate() - 30); break;
            case '90d': startDate.setDate(now.getDate() - 90); break;
        }

        const [totalUsers, totalCreators, totalContent, totalRevenue, activeSubscriptions] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact', head: true }),
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('account_type', 'creator'),
            supabase.from('content').select('id', { count: 'exact', head: true }),
            supabase.from('earnings').select('amount').gte('created_at', startDate.toISOString()),
            supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active')
        ]);

        const platformRevenue = totalRevenue.data?.reduce((sum, e) => sum + e.amount, 0) || 0;

        res.json({
            users: {
                total: totalUsers.count || 0,
                creators: totalCreators.count || 0,
                fans: (totalUsers.count || 0) - (totalCreators.count || 0)
            },
            content: {
                total: totalContent.count || 0
            },
            revenue: {
                total: platformRevenue,
                timeRange
            },
            subscriptions: {
                active: activeSubscriptions.count || 0
            },
            periodStart: startDate.toISOString(),
            periodEnd: now.toISOString()
        });

    } catch (error) {
        console.error('Platform stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Top Performing Content
 * GET /api/analytics/:creatorId/top-content
 */
router.get('/:creatorId/top-content', async (req, res) => {
    try {
        const { creatorId } = req.params;
        const { limit = 10 } = req.query;

        const { data, error } = await supabase
            .from('content')
            .select(`
                id,
                title,
                type,
                views_count,
                likes_count,
                created_at
            `)
            .eq('creator_id', creatorId)
            .order('views_count', { ascending: false })
            .limit(parseInt(limit));

        if (error) throw error;

        res.json({
            success: true,
            topContent: data || []
        });

    } catch (error) {
        console.error('Top content error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

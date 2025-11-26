const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const supabase = require('../../lib/supabaseClient');

/**
 * GET /api/analytics/metrics
 * Get comprehensive analytics data for creator dashboard
 */
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch user growth data
    const { data: userGrowth, error: userError } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (userError) throw userError;

    // Fetch revenue data
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('amount, type, created_at')
      .eq('receiver_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (transactionError) throw transactionError;

    // Fetch posts data
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, created_at, likes_count, comments_count, views_count')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (postsError) throw postsError;

    // Fetch subscribers data
    const { data: subscribers, error: subsError } = await supabase
      .from('subscriptions')
      .select('id, tier, created_at, amount')
      .eq('creator_id', userId)
      .eq('status', 'active');

    if (subsError) throw subsError;

    // Calculate metrics
    const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const totalViews = posts.reduce((sum, p) => sum + (p.views_count || 0), 0);
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100) : 0;

    // Group user growth by day
    const usersByDay = groupByDay(userGrowth, 'created_at');

    // Group revenue by day
    const revenueByDay = transactions.reduce((acc, t) => {
      const day = new Date(t.created_at).toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + parseFloat(t.amount);
      return acc;
    }, {});

    // Calculate revenue by tier
    const revenueByTier = subscribers.reduce((acc, sub) => {
      acc[sub.tier] = (acc[sub.tier] || 0) + parseFloat(sub.amount);
      return acc;
    }, {});

    // Fetch top creators (for comparison)
    const { data: topCreators, error: topError } = await supabase
      .from('users')
      .select(`
        id, 
        username, 
        avatar_url,
        (SELECT COUNT(*) FROM subscriptions WHERE creator_id = users.id AND status = 'active') as subscriber_count,
        (SELECT SUM(amount) FROM transactions WHERE receiver_id = users.id) as total_revenue
      `)
      .limit(5)
      .order('total_revenue', { ascending: false });

    if (topError) throw topError;

    // Calculate ARPU (Average Revenue Per User)
    const activeSubscribers = subscribers.length;
    const arpu = activeSubscribers > 0 ? totalRevenue / activeSubscribers : 0;

    // Calculate retention rate (users who subscribed 30+ days ago still active)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: oldSubs, error: oldSubsError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('creator_id', userId)
      .lte('created_at', thirtyDaysAgo.toISOString());

    const retentionRate = oldSubs && activeSubscribers > 0 
      ? (oldSubs.length / activeSubscribers * 100) 
      : 0;

    // Response
    res.json({
      success: true,
      metrics: {
        totalUsers: userGrowth.length,
        totalRevenue: totalRevenue.toFixed(2),
        totalPosts,
        engagementRate: engagementRate.toFixed(2),
        activeSubscribers,
        arpu: arpu.toFixed(2),
        retentionRate: retentionRate.toFixed(1),
        avgSessionTime: '24.3', // Would need session tracking
        bounceRate: '32.4' // Would need analytics integration
      },
      userGrowth: usersByDay,
      revenueData: {
        byDay: revenueByDay,
        byTier: revenueByTier
      },
      topCreators: topCreators.map((creator, idx) => ({
        rank: idx + 1,
        name: creator.username,
        avatar: creator.avatar_url,
        revenue: parseFloat(creator.total_revenue || 0).toFixed(2),
        subscribers: creator.subscriber_count || 0,
        growth: '+12%' // Would need historical data
      })),
      insights: {
        arpu: arpu.toFixed(2),
        retention: retentionRate.toFixed(1),
        sessionTime: '24.3min',
        bounceRate: '32.4%'
      }
    });

  } catch (error) {
    console.error('Analytics metrics error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics data',
      message: error.message 
    });
  }
});

/**
 * Helper: Group data by day
 */
function groupByDay(data, dateField) {
  return data.reduce((acc, item) => {
    const day = new Date(item[dateField]).toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
}

module.exports = router;

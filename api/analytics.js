const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware to verify creator authentication
const requireCreator = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['creator', 'admin'].includes(profile.role)) {
      return res.status(403).json({ error: 'Creator access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get revenue overview
router.get('/overview', requireCreator, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const daysAgo = parseInt(timeframe) || 30;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    // Get subscription revenue
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('amount, created_at')
      .eq('creator_id', req.user.id)
      .eq('status', 'active')
      .gte('created_at', startDate);

    // Get merchandise revenue
    const { data: merchOrders } = await supabase
      .from('orders')
      .select('total, created_at')
      .eq('creator_id', req.user.id)
      .eq('status', 'completed')
      .gte('created_at', startDate);

    // Get tip revenue
    const { data: tips } = await supabase
      .from('tips')
      .select('amount, created_at')
      .eq('creator_id', req.user.id)
      .gte('created_at', startDate);

    // Calculate totals
    const subscriptionRevenue = subscriptions?.reduce((sum, s) => sum + s.amount, 0) || 0;
    const merchRevenue = merchOrders?.reduce((sum, o) => sum + o.total, 0) || 0;
    const tipRevenue = tips?.reduce((sum, t) => sum + t.amount, 0) || 0;
    const totalRevenue = subscriptionRevenue + merchRevenue + tipRevenue;

    // Get subscriber count
    const { count: subscriberCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', req.user.id)
      .eq('status', 'active');

    res.json({
      overview: {
        total_revenue: totalRevenue.toFixed(2),
        subscription_revenue: subscriptionRevenue.toFixed(2),
        merch_revenue: merchRevenue.toFixed(2),
        tip_revenue: tipRevenue.toFixed(2),
        subscriber_count: subscriberCount || 0,
        timeframe: `${daysAgo} days`
      }
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch revenue overview' });
  }
});

// Get revenue chart data
router.get('/chart', requireCreator, async (req, res) => {
  try {
    const { timeframe = '30d', type = 'all' } = req.query;
    const daysAgo = parseInt(timeframe) || 30;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Generate daily buckets
    const dailyRevenue = {};
    for (let i = 0; i < daysAgo; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyRevenue[dateStr] = { subscriptions: 0, merch: 0, tips: 0 };
    }

    // Fetch and aggregate data
    if (type === 'all' || type === 'subscriptions') {
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('amount, created_at')
        .eq('creator_id', req.user.id)
        .gte('created_at', startDate.toISOString());

      subscriptions?.forEach(s => {
        const date = s.created_at.split('T')[0];
        if (dailyRevenue[date]) {
          dailyRevenue[date].subscriptions += s.amount;
        }
      });
    }

    if (type === 'all' || type === 'merch') {
      const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at')
        .eq('creator_id', req.user.id)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      orders?.forEach(o => {
        const date = o.created_at.split('T')[0];
        if (dailyRevenue[date]) {
          dailyRevenue[date].merch += o.total;
        }
      });
    }

    if (type === 'all' || type === 'tips') {
      const { data: tips } = await supabase
        .from('tips')
        .select('amount, created_at')
        .eq('creator_id', req.user.id)
        .gte('created_at', startDate.toISOString());

      tips?.forEach(t => {
        const date = t.created_at.split('T')[0];
        if (dailyRevenue[date]) {
          dailyRevenue[date].tips += t.amount;
        }
      });
    }

    // Format for chart
    const chartData = Object.entries(dailyRevenue).map(([date, amounts]) => ({
      date,
      subscriptions: amounts.subscriptions,
      merch: amounts.merch,
      tips: amounts.tips,
      total: amounts.subscriptions + amounts.merch + amounts.tips
    }));

    res.json({ chart_data: chartData });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// Get top supporters
router.get('/supporters', requireCreator, async (req, res) => {
  try {
    const { timeframe = '30d', limit = 10 } = req.query;
    const daysAgo = parseInt(timeframe) || 30;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    // Get all supporter contributions
    const [subscriptions, orders, tips] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('user_id, amount, user:profiles!user_id(username, avatar_url)')
        .eq('creator_id', req.user.id)
        .eq('status', 'active')
        .gte('created_at', startDate),
      supabase
        .from('orders')
        .select('user_id, total, user:profiles!user_id(username, avatar_url)')
        .eq('creator_id', req.user.id)
        .eq('status', 'completed')
        .gte('created_at', startDate),
      supabase
        .from('tips')
        .select('user_id, amount, user:profiles!user_id(username, avatar_url)')
        .eq('creator_id', req.user.id)
        .gte('created_at', startDate)
    ]);

    // Aggregate by user
    const supporterMap = new Map();

    subscriptions.data?.forEach(s => {
      if (!supporterMap.has(s.user_id)) {
        supporterMap.set(s.user_id, {
          user_id: s.user_id,
          username: s.user?.username || 'Anonymous',
          avatar_url: s.user?.avatar_url,
          subscriptions: 0,
          merch: 0,
          tips: 0
        });
      }
      supporterMap.get(s.user_id).subscriptions += s.amount;
    });

    orders.data?.forEach(o => {
      if (!supporterMap.has(o.user_id)) {
        supporterMap.set(o.user_id, {
          user_id: o.user_id,
          username: o.user?.username || 'Anonymous',
          avatar_url: o.user?.avatar_url,
          subscriptions: 0,
          merch: 0,
          tips: 0
        });
      }
      supporterMap.get(o.user_id).merch += o.total;
    });

    tips.data?.forEach(t => {
      if (!supporterMap.has(t.user_id)) {
        supporterMap.set(t.user_id, {
          user_id: t.user_id,
          username: t.user?.username || 'Anonymous',
          avatar_url: t.user?.avatar_url,
          subscriptions: 0,
          merch: 0,
          tips: 0
        });
      }
      supporterMap.get(t.user_id).tips += t.amount;
    });

    // Calculate totals and sort
    const supporters = Array.from(supporterMap.values())
      .map(s => ({
        ...s,
        total: s.subscriptions + s.merch + s.tips
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, parseInt(limit));

    res.json({ supporters });
  } catch (error) {
    console.error('Error fetching supporters:', error);
    res.status(500).json({ error: 'Failed to fetch supporters' });
  }
});

// Get revenue breakdown by content
router.get('/content', requireCreator, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const daysAgo = parseInt(timeframe) || 30;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    const { data: contentRevenue } = await supabase
      .from('content_revenue')
      .select('content_id, content_title, views, revenue')
      .eq('creator_id', req.user.id)
      .gte('date', startDate)
      .order('revenue', { ascending: false })
      .limit(10);

    res.json({ content_revenue: contentRevenue || [] });
  } catch (error) {
    console.error('Error fetching content revenue:', error);
    res.status(500).json({ error: 'Failed to fetch content revenue' });
  }
});

// Get payout history
router.get('/payouts', requireCreator, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('payouts')
      .select('*', { count: 'exact' })
      .eq('creator_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      payouts: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

// Request payout
router.post('/payouts', requireCreator, async (req, res) => {
  try {
    // Get available balance
    const { data: balance } = await supabase
      .from('creator_balances')
      .select('available_balance')
      .eq('creator_id', req.user.id)
      .single();

    if (!balance || balance.available_balance < 50) {
      return res.status(400).json({ error: 'Minimum payout amount is $50' });
    }

    // Create payout request
    const { data: payout, error } = await supabase
      .from('payouts')
      .insert({
        creator_id: req.user.id,
        amount: balance.available_balance,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Update balance
    await supabase
      .from('creator_balances')
      .update({
        available_balance: 0,
        pending_balance: balance.available_balance
      })
      .eq('creator_id', req.user.id);

    res.status(201).json({ payout });
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({ error: 'Failed to request payout' });
  }
});

// Get balance
router.get('/balance', requireCreator, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('creator_balances')
      .select('*')
      .eq('creator_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Create if doesn't exist
    if (!data) {
      const { data: newBalance, error: insertError } = await supabase
        .from('creator_balances')
        .insert({
          creator_id: req.user.id,
          available_balance: 0,
          pending_balance: 0,
          total_earned: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return res.json({ balance: newBalance });
    }

    res.json({ balance: data });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

module.exports = router;

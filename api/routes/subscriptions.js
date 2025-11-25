/**
 * Subscriptions API - Creator Subscriptions
 * Fully integrated with Supabase
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { supabase } = require('../lib/supabaseServer');

router.post('/create-checkout', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { creatorId, tier, priceCents } = req.body;
    if (!creatorId || !tier) return res.status(400).json({ error: 'Creator ID and tier required' });
    // TODO: Create Stripe checkout session
    // For now, just create subscription record
    const { data } = await supabase.from('subscriptions').insert([{ subscriber_id: userId, creator_id: creatorId, tier, status: 'active', renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }]).select().single();
    res.json({ success: true, subscription: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create checkout' });
  }
});

router.get('/check/:creatorId', authenticateToken, async (req, res) => {
  try {
    const { data } = await supabase.from('subscriptions').select('*').eq('subscriber_id', req.user.userId).eq('creator_id', req.params.creatorId).eq('status', 'active').single();
    res.json({ subscribed: !!data, subscription: data });
  } catch (error) {
    res.json({ subscribed: false, subscription: null });
  }
});

router.get('/my-subscriptions', authenticateToken, async (req, res) => {
  try {
    const { data } = await supabase.from('subscriptions').select('*, creator:users!subscriptions_creator_id_fkey(id, email, display_name, avatar_url)').eq('subscriber_id', req.user.userId).eq('status', 'active');
    res.json({ subscriptions: data || [], count: data ? data.length : 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load subscriptions' });
  }
});

router.get('/my-subscribers', authenticateToken, async (req, res) => {
  try {
    const { data } = await supabase.from('subscriptions').select('*, subscriber:users!subscriptions_subscriber_id_fkey(id, email, display_name, avatar_url)').eq('creator_id', req.user.userId).eq('status', 'active');
    res.json({ subscribers: data || [], count: data ? data.length : 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load subscribers' });
  }
});

router.delete('/:subscriptionId', authenticateToken, async (req, res) => {
  try {
    await supabase.from('subscriptions').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', req.params.subscriptionId).eq('subscriber_id', req.user.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router;

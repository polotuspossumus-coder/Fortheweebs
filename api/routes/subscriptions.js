/**
 * Subscriptions API - Creator Subscriptions & Monetization
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Mock database
let subscriptions = [];
let subscriptionIdCounter = 1;

// Subscription tiers (monthly prices in cents)
const SUBSCRIPTION_TIERS = {
  BASIC: { name: 'Basic', price: 500, features: ['Access to posts', 'DM creator'] },
  PREMIUM: { name: 'Premium', price: 1000, features: ['All Basic', 'Exclusive content', 'Priority support'] },
  VIP: { name: 'VIP', price: 2500, features: ['All Premium', 'Private video calls', 'Custom content requests'] }
};

/**
 * POST /api/subscriptions/create-checkout
 * Create Stripe checkout session for subscription
 */
router.post('/create-checkout', authenticateToken, async (req, res) => {
  try {
    const { userId, email } = req.user;
    const { creatorId, tier, priceCents } = req.body;

    if (!creatorId) {
      return res.status(400).json({ error: 'Creator ID is required' });
    }

    if (!tier && !priceCents) {
      return res.status(400).json({ error: 'Tier or price is required' });
    }

    const price = priceCents || SUBSCRIPTION_TIERS[tier]?.price;

    if (!price) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Subscription to Creator ${creatorId}`,
              description: tier ? SUBSCRIPTION_TIERS[tier].name : 'Custom tier'
            },
            unit_amount: price,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        subscriberId: userId,
        creatorId,
        tier: tier || 'CUSTOM'
      },
      success_url: `${process.env.VITE_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.VITE_APP_URL}/dashboard?subscription=cancelled`
    });

    console.log(`💎 Subscription checkout created for user ${userId} -> creator ${creatorId}`);

    res.json({
      sessionId: session.id,
      sessionUrl: session.url
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/subscriptions/webhook
 * Handle Stripe subscription webhooks
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const { subscriberId, creatorId, tier } = session.metadata;

      // Create subscription record
      const newSubscription = {
        id: subscriptionIdCounter++,
        subscriberId,
        creatorId,
        tier,
        stripeSubscriptionId: session.subscription,
        status: 'active',
        createdAt: new Date().toISOString(),
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      subscriptions.push(newSubscription);

      // TODO: Insert into Supabase
      // await supabase.from('subscriptions').insert([{
      //   subscriber_id: subscriberId,
      //   creator_id: creatorId,
      //   tier,
      //   stripe_subscription_id: session.subscription,
      //   status: 'active'
      // }]);

      console.log(`✅ Subscription activated: ${subscriberId} -> ${creatorId}`);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      const sub = subscriptions.find(s => s.stripeSubscriptionId === deletedSubscription.id);
      if (sub) {
        sub.status = 'cancelled';
        sub.cancelledAt = new Date().toISOString();
      }
      console.log(`❌ Subscription cancelled: ${deletedSubscription.id}`);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * GET /api/subscriptions/my-subscriptions
 * Get user's active subscriptions
 */
router.get('/my-subscriptions', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const userSubscriptions = subscriptions
      .filter(s => s.subscriberId === userId && s.status === 'active');

    res.json({
      subscriptions: userSubscriptions,
      count: userSubscriptions.length
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to load subscriptions' });
  }
});

/**
 * GET /api/subscriptions/my-subscribers
 * Get creator's subscribers
 */
router.get('/my-subscribers', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const creatorSubscribers = subscriptions
      .filter(s => s.creatorId === userId && s.status === 'active');

    res.json({
      subscribers: creatorSubscribers,
      count: creatorSubscribers.length,
      monthlyRevenue: creatorSubscribers.reduce((sum, s) => {
        const tierPrice = SUBSCRIPTION_TIERS[s.tier]?.price || 0;
        return sum + tierPrice;
      }, 0)
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Failed to load subscribers' });
  }
});

/**
 * DELETE /api/subscriptions/:subscriptionId
 * Cancel a subscription
 */
router.delete('/:subscriptionId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { subscriptionId } = req.params;

    const subscription = subscriptions.find(s =>
      s.id === parseInt(subscriptionId) && s.subscriberId === userId
    );

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Cancel in Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date().toISOString();

    console.log(`❌ Subscription ${subscriptionId} cancelled by user ${userId}`);

    res.json({
      success: true,
      message: 'Subscription cancelled'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * GET /api/subscriptions/check/:creatorId
 * Check if user is subscribed to a creator
 */
router.get('/check/:creatorId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { creatorId } = req.params;

    const subscription = subscriptions.find(s =>
      s.subscriberId === userId &&
      s.creatorId === creatorId &&
      s.status === 'active'
    );

    res.json({
      isSubscribed: !!subscription,
      subscription: subscription || null
    });
  } catch (error) {
    console.error('Check subscription error:', error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

module.exports = router;

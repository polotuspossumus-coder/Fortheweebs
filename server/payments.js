const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

// Lightweight Create Checkout Session endpoint. Requires STRIPE_SECRET_KEY env var.
router.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, successUrl, cancelUrl, metadata } = req.body || {};
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
  }

  let Stripe;
  try {
    Stripe = require('stripe');
  } catch (err) {
    return res.status(500).json({ error: 'stripe library not installed. Run `npm i stripe`' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${req.protocol}://${req.get('host')}/payments/success`,
      cancel_url: cancelUrl || `${req.protocol}://${req.get('host')}/payments/cancel`,
      metadata: metadata || {},
    });
    res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('stripe session error', err);
    res.status(500).json({ error: err.message || 'failed to create session' });
  }
});

// Webhook endpoint - expects raw body. We'll export a handler that the server can mount with raw body parsing.
router.post('/api/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).send('stripe not configured');
  let Stripe;
  try {
    Stripe = require('stripe');
  } catch (e) {
    return res.status(500).send('stripe package missing');
  }
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    // If no webhook secret, attempt to parse JSON body normally
    try {
      const event = JSON.parse(req.body.toString());
      // handle event types minimally
      console.log('webhook event (no secret):', event.type);
      res.json({ received: true });
    } catch (err) {
      console.error('webhook parse error', err);
      res.status(400).send('Invalid payload');
    }
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Minimal event handling - extend as needed
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Checkout session completed', event.data.object.id);
      // TODO: verify payment, create ledger entry, notify user
      break;
    case 'payment_intent.succeeded':
      console.log('Payment succeeded', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;

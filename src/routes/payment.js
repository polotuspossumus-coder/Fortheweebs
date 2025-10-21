import process from 'process';

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import Stripe from 'stripe';
import { logLedger } from '../utils/ledger.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

// Helper to get tier price
const TIER_PRICES = {
  mythic: 20000,
  standard: 20000,
  legacy: 10000,
  supporter: 5000,
  general: 1500,
};
function getTierPrice(tier) {
  return TIER_PRICES[tier] || 0;
}

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const tier = session.metadata?.tier;
    const userId = session.metadata?.userId;

    await logLedger('payment', userId, tier, { amount: session.amount_total });
    // TODO: assign tier to user in DB
  }

  res.json({ received: true });
});

router.post('/initiate', async (req, res) => {
  const { tier, userId } = req.body;
  const price = getTierPrice(tier);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier` },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    metadata: { tier, userId },
  });
  res.json({ url: session.url });
});

export default router;

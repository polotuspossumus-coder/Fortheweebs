// api/stripeCheckout.js
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../lib/stripeConfig.js';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

const TIER_PRICES = {
  mythic: 20000, // $200 in cents
  standard: 10000, // $100 in cents
  supporter: 5000, // $50 in cents
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { tier, userId } = req.body;
  if (!TIER_PRICES[tier]) return res.status(400).json({ error: 'Invalid tier' });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier` },
          unit_amount: TIER_PRICES[tier],
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.headers.origin}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin}/onboarding/cancel`,
    metadata: { userId, tier },
  });
  res.status(200).json({ url: session.url });
}

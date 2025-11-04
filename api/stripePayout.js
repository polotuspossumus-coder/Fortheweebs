// api/stripePayout.js
// This endpoint will be used to split creator profits using Stripe Connect
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../lib/stripeConfig.js';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

// Example: POST { amount, creatorStripeId, platformShare }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { amount, creatorStripeId, platformShare } = req.body;
  if (!amount || !creatorStripeId || !platformShare) return res.status(400).json({ error: 'Missing params' });

  // Calculate split
  const platformAmount = Math.round(amount * platformShare);
  const creatorAmount = amount - platformAmount;

  // Create a PaymentIntent with transfer to creator
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    payment_method_types: ['card'],
    transfer_data: {
      destination: creatorStripeId,
      amount: creatorAmount,
    },
    // The platform keeps the remainder
  });

  res.status(200).json({ paymentIntent });
}

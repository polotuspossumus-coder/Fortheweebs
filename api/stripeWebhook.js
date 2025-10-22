// api/stripeWebhook.js
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '../lib/stripeConfig.js';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
  // const session = event.data.object; // Removed unused variable
    // TODO: Unlock tier for userId in session.metadata.userId
    // TODO: Log payment and update user record
  }

  res.status(200).json({ received: true });
}

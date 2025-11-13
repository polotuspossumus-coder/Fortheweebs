/**
 * STRIPE WEBHOOKS
 * Handles payment confirmations, subscription events, etc.
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_PLACEHOLDER';

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  
  let event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePaymentSuccess(paymentIntent) {
  const { type, creatorId, buyerId, commissionId } = paymentIntent.metadata;

  console.log('Payment succeeded:', {
    type,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    creatorId,
    buyerId
  });

  // TODO: Update database based on payment type
  if (type === 'tip') {
    // Record tip in database
    // Notify creator
    console.log(`Tip of $${paymentIntent.amount / 100} for creator ${creatorId}`);
  } else if (type === 'commission') {
    // Mark commission as paid
    // Notify creator to start work
    // Notify buyer of confirmation
    console.log(`Commission ${commissionId} purchased for $${paymentIntent.amount / 100}`);
  }
}

async function handlePaymentFailed(paymentIntent) {
  const { type, creatorId, buyerId } = paymentIntent.metadata;

  console.error('Payment failed:', {
    type,
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.last_payment_error?.message
  });

  // TODO: Notify user of failed payment
}

async function handleSubscriptionUpdate(subscription) {
  const { userId, tier } = subscription.metadata;

  console.log('Subscription updated:', {
    subscriptionId: subscription.id,
    userId,
    tier,
    status: subscription.status
  });

  // TODO: Update user tier in database
  // Grant access to tier features
  if (subscription.status === 'active') {
    console.log(`User ${userId} upgraded to ${tier}`);
  }
}

async function handleSubscriptionCanceled(subscription) {
  const { userId, tier } = subscription.metadata;

  console.log('Subscription canceled:', {
    subscriptionId: subscription.id,
    userId,
    tier
  });

  // TODO: Downgrade user tier in database
  // Remove tier features
  console.log(`User ${userId} downgraded from ${tier}`);
}

async function handleInvoicePaid(invoice) {
  console.log('Invoice paid:', {
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    amount: invoice.amount_paid / 100
  });

  // TODO: Record payment in database
}

async function handleInvoiceFailed(invoice) {
  console.error('Invoice payment failed:', {
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    amount: invoice.amount_due / 100
  });

  // TODO: Notify user, attempt retry
}

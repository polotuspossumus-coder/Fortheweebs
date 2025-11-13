/**
 * STRIPE WEBHOOKS
 * Handles payment confirmations, subscription events, etc.
 */

import Stripe from 'stripe';
import admin from 'firebase-admin';

// Initialize Firebase Admin (serverside only)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();
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
  const { type, creatorId, buyerId, commissionId, message, timestamp } = paymentIntent.metadata;

  console.log('Payment succeeded:', {
    type,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    creatorId,
    buyerId
  });

  try {
    // Create transaction record
    await db.collection('transactions').add({
      type,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'completed',
      creatorId,
      buyerId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    if (type === 'tip') {
      // Record tip in database
      await db.collection('tips').add({
        senderId: buyerId,
        creatorId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        message: message || '',
        paymentIntentId: paymentIntent.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update creator balance
      const creatorRef = db.collection('users').doc(creatorId);
      await creatorRef.update({
        balance: admin.firestore.FieldValue.increment(paymentIntent.amount / 100),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Tip recorded: $${paymentIntent.amount / 100} to creator ${creatorId}`);
    }

    if (type === 'commission') {
      // Record commission purchase
      const platformFee = parseFloat(paymentIntent.metadata.platformFee) / 100;
      const creatorAmount = parseFloat(paymentIntent.metadata.creatorAmount) / 100;

      await db.collection('commissionOrders').add({
        commissionId,
        buyerId,
        creatorId,
        totalAmount: paymentIntent.amount / 100,
        platformFee,
        creatorAmount,
        status: 'pending',
        paymentStatus: 'paid',
        paymentIntentId: paymentIntent.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update creator balance (85% after platform fee)
      const creatorRef = db.collection('users').doc(creatorId);
      await creatorRef.update({
        balance: admin.firestore.FieldValue.increment(creatorAmount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Commission purchase recorded: $${creatorAmount} to creator ${creatorId}`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  const { type, creatorId, buyerId } = paymentIntent.metadata;

  console.error('Payment failed:', {
    type,
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.last_payment_error?.message
  });

  try {
    // Record failed transaction
    await db.collection('transactions').add({
      type,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'failed',
      creatorId,
      buyerId,
      errorMessage: paymentIntent.last_payment_error?.message,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`❌ Failed payment recorded for ${type}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleSubscriptionUpdate(subscription) {
  const { userId, tier } = subscription.metadata;
  const status = subscription.status;

  console.log('Subscription updated:', {
    subscriptionId: subscription.id,
    userId,
    tier,
    status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  });

  try {
    // Create/update subscription record
    const subscriptionRef = db.collection('subscriptions').doc(subscription.id);
    await subscriptionRef.set({
      userId,
      tier,
      status,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      currentPeriodStart: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Update user's tier
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      tier,
      subscriptionStatus: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Subscription updated for user ${userId}: tier=${tier}, status=${status}`);
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionCanceled(subscription) {
  const { userId, tier } = subscription.metadata;

  console.log('Subscription canceled:', {
    subscriptionId: subscription.id,
    userId,
    tier
  });

  try {
    // Update subscription status in database
    const subscriptionRef = db.collection('subscriptions').doc(subscription.id);
    await subscriptionRef.update({
      status: 'canceled',
      canceledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Downgrade user to free tier
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      tier: 'free',
      subscriptionStatus: 'canceled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ User ${userId} downgraded from ${tier} to free`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handleInvoicePaid(invoice) {
  console.log('Invoice paid:', {
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    amount: invoice.amount_paid / 100
  });

  try {
    // Record invoice payment
    await db.collection('transactions').add({
      type: 'subscription_payment',
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Invoice payment recorded: $${invoice.amount_paid / 100}`);
  } catch (error) {
    console.error('Error recording invoice payment:', error);
  }
}

async function handleInvoiceFailed(invoice) {
  console.error('Invoice payment failed:', {
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    amount: invoice.amount_due / 100
  });

  try {
    // Record failed invoice
    await db.collection('transactions').add({
      type: 'subscription_payment',
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      status: 'failed',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update subscription status
    if (invoice.subscription) {
      const subscriptionRef = db.collection('subscriptions').doc(invoice.subscription);
      await subscriptionRef.update({
        status: 'past_due',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log(`❌ Failed invoice recorded: $${invoice.amount_due / 100}`);
  } catch (error) {
    console.error('Error handling invoice failure:', error);
  }
}

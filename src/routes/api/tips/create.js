/**
 * TIPS PAYMENT API
 * Creates Stripe Payment Intent for creator tips
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER');

export async function POST(request) {
  try {
    const { creatorId, amount, message, currency = 'usd' } = await request.json();

    // Validation
    if (!creatorId || !amount) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: creatorId, amount'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (amount < 1 || amount > 10000) {
      return new Response(JSON.stringify({
        error: 'Amount must be between $1 and $10,000'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: {
        type: 'tip',
        creatorId: creatorId,
        message: message || '',
        timestamp: new Date().toISOString()
      },
      description: `Tip for creator ${creatorId}`
    });

    // Store tip in database (TODO: Add database integration)
    console.log('Tip payment intent created:', {
      paymentIntentId: paymentIntent.id,
      creatorId,
      amount,
      status: paymentIntent.status
    });

    return new Response(JSON.stringify({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Tips API error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to create payment intent'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

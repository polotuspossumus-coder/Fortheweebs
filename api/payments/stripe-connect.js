// payments/stripe-connect.js - Stripe Connect payouts
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { writeArtifact } = require('../../utils/server-safety');
const { storeIdempotencyKey } = require('../../utils/idempotency');

// Create payout to creator
async function createPayout(creatorStripeAccountId, amount, currency, metadata, idempotencyKey) {
  const payoutReceipt = {
    timestamp: new Date().toISOString(),
    creatorStripeAccountId,
    amount,
    currency,
    metadata,
    idempotencyKey,
    result: null,
    error: null,
  };
  
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      destination: creatorStripeAccountId,
      metadata,
    }, {
      idempotencyKey,
    });
    
    payoutReceipt.result = {
      transferId: transfer.id,
      status: transfer.object,
      created: transfer.created,
    };
    
    // Store idempotency key
    await storeIdempotencyKey(idempotencyKey, payoutReceipt);
    
  } catch (error) {
    console.error('[StripeConnect] Transfer failed:', error);
    payoutReceipt.error = error.message;
    throw error;
  } finally {
    await writeArtifact('stripeTransfer', payoutReceipt);
  }
  
  return payoutReceipt.result;
}

// Verify Stripe webhook signature
function verifyWebhook(payload, signature) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('[StripeConnect] Webhook verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

module.exports = {
  createPayout,
  verifyWebhook,
};

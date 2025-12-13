const express = require('express');
const router = express.Router();
const crypto = require('crypto');

/**
 * Segpay Payment Integration for Adult Content
 * Use this for subscriptions and one-time purchases of adult content
 * Stripe is used for non-adult content only
 */

// Segpay credentials from environment
const SEGPAY_MERCHANT_ID = process.env.SEGPAY_MERCHANT_ID;
const SEGPAY_API_KEY = process.env.SEGPAY_API_KEY;
const SEGPAY_SECRET = process.env.SEGPAY_SECRET;

// Segpay API endpoints
const SEGPAY_API_BASE = process.env.SEGPAY_API_BASE || 'https://secure2.segpay.com/api';

/**
 * Create Segpay checkout session
 * POST /api/segpay/create-checkout
 */
router.post('/create-checkout', async (req, res) => {
  try {
    const { userId, amount, description, isAdult, subscriptionPlan } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: 'userId and amount required' });
    }

    // Verify user is 18+ for adult content
    if (isAdult) {
      const userAge = await verifyUserAge(userId);
      if (userAge < 18) {
        return res.status(403).json({ error: 'Adult content requires 18+ verification' });
      }
    }

    // Create Segpay purchase data
    const purchaseData = {
      merchantId: SEGPAY_MERCHANT_ID,
      amount: amount,
      currency: 'USD',
      description: description || 'ForTheWeebs Purchase',
      userId: userId,
      successUrl: `${process.env.VITE_APP_URL}/payment/success`,
      cancelUrl: `${process.env.VITE_APP_URL}/payment/cancel`,
      webhookUrl: `${process.env.VITE_API_URL}/api/segpay/webhook`,
      customData: JSON.stringify({
        userId,
        isAdult,
        subscriptionPlan
      })
    };

    // Generate signature for security
    const signature = generateSegpaySignature(purchaseData);
    purchaseData.signature = signature;

    // For now, return checkout URL (Segpay provides this after account setup)
    // Once you have Segpay credentials, uncomment the API call below
    
    /*
    const response = await fetch(`${SEGPAY_API_BASE}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': SEGPAY_API_KEY
      },
      body: JSON.stringify(purchaseData)
    });

    const data = await response.json();
    */

    // Temporary response until Segpay is configured
    res.json({
      checkoutUrl: `${SEGPAY_API_BASE}/checkout?merchant=${SEGPAY_MERCHANT_ID}`,
      sessionId: `temp_${Date.now()}`,
      message: 'Segpay integration ready - add credentials to .env'
    });

  } catch (error) {
    console.error('Segpay checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * Handle Segpay webhook notifications
 * POST /api/segpay/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-segpay-signature'];
    const payload = req.body;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', SEGPAY_SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(payload.toString());

    // Handle different event types
    switch (event.type) {
      case 'payment.success':
        await handlePaymentSuccess(event.data);
        break;
      
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data);
        break;
      
      case 'chargeback':
        await handleChargeback(event.data);
        break;
      
      default:

    }

    res.json({ received: true });

  } catch (error) {
    console.error('Segpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Get payment status
 * GET /api/segpay/payment/:transactionId
 */
router.get('/payment/:transactionId', async (req, res) => {
  try {
    const { userId, transactionId } = req.params;

    // Query Segpay API for transaction status
    // Uncomment when Segpay is configured:
    /*
    const response = await fetch(`${SEGPAY_API_BASE}/transaction/${transactionId}`, {
      headers: {
        'X-API-Key': SEGPAY_API_KEY
      }
    });

    const data = await response.json();
    res.json(data);
    */

    res.json({
      transactionId,
      status: 'pending',
      message: 'Add Segpay credentials to check real status'
    });

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// Helper functions

function generateSegpaySignature(data) {
  const signatureString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('&');
  
  return crypto
    .createHmac('sha256', SEGPAY_SECRET || 'temp_secret')
    .update(signatureString)
    .digest('hex');
}

async function verifyUserAge(userId) {
  // Check user age from database
  // Return 18 for now - implement with real user data
  return 18;
}

async function handlePaymentSuccess(data) {

  // Update database with payment info
  // Grant access to purchased content
}

async function handleSubscriptionCreated(data) {

  // Add subscription to user account
  // Grant subscription benefits
}

async function handleSubscriptionCancelled(data) {

  // Revoke subscription benefits
  // Update user status
}

async function handleChargeback(data) {

  // Revoke access immediately
  // Flag user account
  // Send notification to admin
}

module.exports = router;

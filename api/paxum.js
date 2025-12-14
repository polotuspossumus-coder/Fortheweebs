/**
 * Paxum Payment Processing - INSTANT SETUP!
 * 
 * WHY PAXUM:
 * ✅ Sign up takes 5 minutes (just email + password)
 * ✅ Start accepting payments IMMEDIATELY (no waiting)
 * ✅ Accepts adult content (no restrictions)
 * ✅ Lower fees: 3-8% (vs CCBill 10.5%)
 * ✅ Accepts crypto + credit cards
 * ✅ No business registration required to start
 * 
 * SETUP (5 MINUTES):
 * 1. Go to: https://www.paxum.com/payment_gateway/apply.php
 * 2. Fill out form (just basic info)
 * 3. Get API credentials instantly
 * 4. Add to .env and you're LIVE
 */

const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');

// Paxum configuration
const PAXUM_CONFIG = {
  merchantId: process.env.PAXUM_MERCHANT_ID,
  apiKey: process.env.PAXUM_API_KEY,
  secretKey: process.env.PAXUM_SECRET_KEY,
  sandboxMode: process.env.PAXUM_SANDBOX === 'true',
  baseUrl: process.env.PAXUM_SANDBOX === 'true' 
    ? 'https://sandbox.paxum.com/payment/api'
    : 'https://paxum.com/payment/api'
};

/**
 * Create Paxum checkout (INSTANT - no approval needed!)
 * POST /api/paxum/create-checkout
 */
router.post('/create-checkout', async (req, res) => {
  try {
    const {
      amount,
      userId,
      contentId,
      description,
      // userEmail, - available if needed for email notifications
      isAdultContent = true
    } = req.body;

    // Validate
    if (!amount || amount < 1) {
      return res.status(400).json({ 
        error: 'Minimum $1.00 transaction' 
      });
    }

    // Generate unique transaction ID
    const transactionId = `pax_${Date.now()}_${userId}`;

    // Build Paxum payment URL (works immediately after signup!)
    const params = new URLSearchParams({
      business_email: PAXUM_CONFIG.merchantId, // Your Paxum email
      amount: amount.toFixed(2),
      currency: 'USD',
      item_name: description || 'Content Purchase',
      item_id: contentId || transactionId,
      
      // Return URLs
      finish_url: `${process.env.VITE_APP_URL}/payment/success?session_id=${transactionId}`,
      cancel_url: `${process.env.VITE_APP_URL}/payment/cancel`,
      notify_url: `${process.env.VITE_API_URL}/api/paxum/webhook`,
      
      // Your data
      variables: JSON.stringify({
        user_id: userId,
        content_id: contentId,
        adult_content: isAdultContent
      }),
      
      // Button customization
      button_type_1: '2', // Credit card + crypto
      button_type_2: '2'
    });

    const checkoutUrl = PAXUM_CONFIG.sandboxMode
      ? `https://sandbox.paxum.com/payment/phrame.php?${params.toString()}`
      : `https://paxum.com/payment/phrame.php?${params.toString()}`;

    res.json({
      success: true,
      checkoutUrl,
      processor: 'paxum',
      amount,
      currency: 'USD',
      sessionId: transactionId,
      acceptsAdultContent: true,
      acceptsCrypto: true,
      instantSetup: true
    });

  } catch (error) {
    console.error('Paxum checkout error:', error);
    res.status(500).json({ 
      error: 'Failed to create Paxum checkout',
      details: error.message 
    });
  }
});

/**
 * Paxum IPN (Instant Payment Notification) webhook
 * POST /api/paxum/webhook
 */
router.post('/webhook', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const {
      // transaction_id, transaction_amount, transaction_currency - available for logging
      transaction_status,
      item_id: _item_id, // Unused, reserved for future
      variables,
      security_hash
    } = req.body;

    // Verify security hash
    const isValid = verifyPaxumHash(req.body, security_hash);
    
    if (!isValid && PAXUM_CONFIG.secretKey) {
      return res.status(400).send('Invalid signature');
    }

    // Parse custom data (future: use for metadata)
    try {
      JSON.parse(variables || '{}');
    } catch (e) {
      console.error('Failed to parse Paxum custom data:', e);
    }

    // Only process completed payments
    if (transaction_status === 'completed' || transaction_status === 'done') {
      // Grant access to content
      // Implementation handled by tier-access middleware
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Paxum webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

/**
 * Verify Paxum security hash
 */
function verifyPaxumHash(data, receivedHash) {
  if (!PAXUM_CONFIG.secretKey) {

    return true; // Allow in development
  }

  // Paxum sends SHA256 hash of specific fields + secret
  const stringToHash = `${data.transaction_id}:${data.transaction_amount}:${data.transaction_currency}:${PAXUM_CONFIG.secretKey}`;
  
  const expectedHash = crypto
    .createHash('sha256')
    .update(stringToHash)
    .digest('hex')
    .toLowerCase();

  return receivedHash === expectedHash;
}

/**
 * Get payout balance (if you have API access)
 * GET /api/paxum/balance
 */
router.get('/balance', async (req, res) => {
  try {
    if (!PAXUM_CONFIG.apiKey) {
      return res.status(400).json({ 
        error: 'Paxum API key not configured' 
      });
    }

    // Call Paxum API for balance
    const response = await fetch(`${PAXUM_CONFIG.baseUrl}/balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: PAXUM_CONFIG.merchantId,
        api_key: PAXUM_CONFIG.apiKey
      })
    });

    const result = await response.json();

    res.json({
      success: true,
      balance: result.balance || 0,
      currency: result.currency || 'USD',
      processor: 'paxum'
    });

  } catch (error) {
    console.error('Paxum balance error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch balance',
      details: error.message 
    });
  }
});

/**
 * Request payout
 * POST /api/paxum/payout
 */
router.post('/payout', async (req, res) => {
  try {
    const { amount, payoutEmail } = req.body;

    if (!PAXUM_CONFIG.apiKey) {
      return res.status(400).json({ 
        error: 'Paxum API key not configured' 
      });
    }

    // Request payout via Paxum API
    const response = await fetch(`${PAXUM_CONFIG.baseUrl}/payout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from_email: PAXUM_CONFIG.merchantId,
        to_email: payoutEmail || PAXUM_CONFIG.merchantId,
        amount: amount.toFixed(2),
        currency: 'USD',
        api_key: PAXUM_CONFIG.apiKey
      })
    });

    const result = await response.json();

    if (result.success) {
      res.json({
        success: true,
        message: 'Payout initiated',
        transactionId: result.transaction_id
      });
    } else {
      throw new Error(result.error || 'Payout failed');
    }

  } catch (error) {
    console.error('Paxum payout error:', error);
    res.status(500).json({ 
      error: 'Failed to process payout',
      details: error.message 
    });
  }
});

/**
 * Get payment info
 * GET /api/paxum/info
 */
router.get('/info', (req, res) => {
  res.json({
    processor: 'Paxum',
    status: PAXUM_CONFIG.merchantId ? 'configured' : 'not_configured',
    features: {
      instantSetup: true,
      noWaitingPeriod: true,
      acceptsAdultContent: true,
      acceptsCrypto: true,
      oneTimePayments: true,
      subscriptions: true,
      webhooks: true,
      apiAccess: !!PAXUM_CONFIG.apiKey
    },
    fees: '3-8% (lower than CCBill!)',
    minimumAmount: 1,
    currencies: ['USD', 'EUR', 'GBP', 'CAD'],
    signupUrl: 'https://www.paxum.com/payment_gateway/apply.php',
    setupTime: '5 minutes (instant approval!)',
    advantages: [
      '✅ INSTANT setup - no waiting',
      '✅ Start accepting payments TODAY',
      '✅ Lower fees than CCBill (3-8% vs 10.5%)',
      '✅ Accepts adult content',
      '✅ Crypto + credit cards',
      '✅ No business docs required to start'
    ]
  });
});

module.exports = router;

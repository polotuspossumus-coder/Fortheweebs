/**
 * CCBill Payment Processing for Adult Content
 * Industry standard for adult content payments
 * 
 * Setup Steps:
 * 1. Sign up: https://www.ccbill.com/apply
 * 2. Get approved (1-3 business days)
 * 3. Add these to .env:
 *    - CCBILL_ACCOUNT_NUMBER=your_account_number
 *    - CCBILL_SUBACCOUNT=your_subaccount (usually 0000)
 *    - CCBILL_FORM_NAME=your_form_name (e.g., "adult_content")
 *    - CCBILL_SALT=your_salt_key (for webhooks)
 *    - CCBILL_FLEX_ID=your_flex_id (optional, for advanced features)
 */

const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');

// CCBill configuration
const CCBILL_CONFIG = {
  accountNumber: process.env.CCBILL_ACCOUNT_NUMBER,
  subaccount: process.env.CCBILL_SUBACCOUNT || '0000',
  formName: process.env.CCBILL_FORM_NAME || 'adult_content',
  salt: process.env.CCBILL_SALT,
  flexId: process.env.CCBILL_FLEX_ID,
  currency: '840' // USD (CCBill uses ISO 4217 codes)
};

/**
 * Create CCBill checkout session
 * POST /api/ccbill/create-checkout
 */
router.post('/create-checkout', async (req, res) => {
  try {
    const {
      amount,
      userId,
      contentId,
      description,
      userEmail,
      userFirstName,
      userLastName,
      isSubscription = false,
      subscriptionPeriod = 30 // days
    } = req.body;

    // Validate amount
    if (!amount || amount < 2.95) {
      return res.status(400).json({ 
        error: 'CCBill requires minimum $2.95 transaction' 
      });
    }

    // Build CCBill payment URL
    const params = new URLSearchParams({
      clientAccnum: CCBILL_CONFIG.accountNumber,
      clientSubacc: CCBILL_CONFIG.subaccount,
      formName: CCBILL_CONFIG.formName,
      formPrice: amount.toFixed(2),
      formPeriod: isSubscription ? subscriptionPeriod : '2', // 2 = one-time
      formRecurringPrice: isSubscription ? amount.toFixed(2) : '',
      formRecurringPeriod: isSubscription ? subscriptionPeriod : '',
      currencyCode: CCBILL_CONFIG.currency,
      
      // Customer info (optional but recommended)
      customer_fname: userFirstName || '',
      customer_lname: userLastName || '',
      email: userEmail || '',
      
      // Your metadata (pass through to webhook)
      user_id: userId,
      content_id: contentId || '',
      description: description || 'Adult content purchase',
      
      // Return URLs
      successUrl: `${process.env.VITE_APP_URL}/payment/success?session_id={subscription_id}`,
      cancelUrl: `${process.env.VITE_APP_URL}/payment/cancel`,
      declineUrl: `${process.env.VITE_APP_URL}/payment/declined`
    });

    const checkoutUrl = `https://bill.ccbill.com/jpost/signup.cgi?${params.toString()}`;

    res.json({
      success: true,
      checkoutUrl,
      processor: 'ccbill',
      amount,
      currency: 'USD',
      sessionId: `ccbill_${Date.now()}_${userId}`
    });

  } catch (error) {
    console.error('CCBill checkout error:', error);
    res.status(500).json({ 
      error: 'Failed to create CCBill checkout',
      details: error.message 
    });
  }
});

/**
 * CCBill webhook handler (called after successful payment)
 * POST /api/ccbill/webhook
 */
router.post('/webhook', express.raw({ type: 'application/x-www-form-urlencoded' }), async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Extract webhook data
    const {
      // subscriptionId, transactionId, clientAccnum, clientSubacc, timestamp, formPrice - available if needed
      // X_user_id, X_content_id, X_description - available in webhookData if needed
      responseDigest // CCBill's verification hash
    } = webhookData;

    // Verify webhook authenticity
    const isValid = verifyCCBillWebhook(webhookData, responseDigest);
    
    if (!isValid) {
      return res.status(400).send('Invalid signature');
    }


    // Grant access to adult content
    // Implementation handled by tier-access middleware
    //   transactionId,
    //   subscriptionId
    // });

    res.status(200).send('OK');

  } catch (error) {
    console.error('CCBill webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

/**
 * Verify CCBill webhook signature
 */
function verifyCCBillWebhook(data, receivedDigest) {
  if (!CCBILL_CONFIG.salt) {

    return true; // Allow in development
  }

  // CCBill sends MD5 hash of: subscription_id + 1 + salt
  const stringToHash = `${data.subscriptionId}1${CCBILL_CONFIG.salt}`;
  const expectedDigest = crypto
    .createHash('md5')
    .update(stringToHash)
    .digest('hex')
    .toUpperCase();

  return receivedDigest === expectedDigest;
}

/**
 * Cancel CCBill subscription
 * POST /api/ccbill/cancel-subscription
 */
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!CCBILL_CONFIG.flexId) {
      return res.status(400).json({ 
        error: 'CCBill FlexForms not configured. Contact CCBill support to enable API access.' 
      });
    }

    // Call CCBill API to cancel subscription
    const response = await fetch('https://api.ccbill.com/transactions/cancel_subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CCBILL_CONFIG.flexId}`
      },
      body: JSON.stringify({
        subscriptionId,
        clientAccnum: CCBILL_CONFIG.accountNumber,
        clientSubacc: CCBILL_CONFIG.subaccount
      })
    });

    const result = await response.json();

    if (result.success) {

      res.json({ success: true, message: 'Subscription cancelled' });
    } else {
      throw new Error(result.error || 'Cancellation failed');
    }

  } catch (error) {
    console.error('CCBill cancellation error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      details: error.message 
    });
  }
});

/**
 * Get payment info (for debugging)
 * GET /api/ccbill/info
 */
router.get('/info', (req, res) => {
  res.json({
    processor: 'CCBill',
    status: CCBILL_CONFIG.accountNumber ? 'configured' : 'not_configured',
    features: {
      oneTimePayments: true,
      subscriptions: true,
      webhooks: !!CCBILL_CONFIG.salt,
      apiAccess: !!CCBILL_CONFIG.flexId
    },
    fees: '10.5% + $0.30',
    minimumAmount: 2.95,
    currency: 'USD',
    signupUrl: 'https://www.ccbill.com/apply'
  });
});

module.exports = router;

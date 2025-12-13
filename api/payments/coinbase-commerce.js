// payments/coinbase-commerce.js - Coinbase Commerce crypto payments
const axios = require('axios');
const { writeArtifact } = require('../../utils/server-safety');
const { storeIdempotencyKey } = require('../../utils/idempotency');

const COINBASE_API_URL = 'https://api.commerce.coinbase.com';
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;

// Create crypto charge
async function createCharge(name, description, amount, currency, metadata, idempotencyKey) {
  const chargeReceipt = {
    timestamp: new Date().toISOString(),
    name,
    description,
    amount,
    currency,
    metadata,
    idempotencyKey,
    result: null,
    error: null,
  };
  
  // Check if Coinbase API key is configured
  if (!COINBASE_API_KEY) {
    chargeReceipt.error = 'Coinbase Commerce not configured (missing API key)';
    writeArtifact('coinbaseChargeSkipped', chargeReceipt);
    throw new Error('Coinbase Commerce API key not configured');
  }
  
  try {
    const response = await axios.post(
      `${COINBASE_API_URL}/charges`,
      {
        name,
        description,
        pricing_type: 'fixed_price',
        local_price: {
          amount: amount.toString(),
          currency: currency || 'USD',
        },
        metadata,
      },
      {
        headers: {
          'X-CC-Api-Key': COINBASE_API_KEY,
          'X-CC-Version': '2018-03-22',
          'Content-Type': 'application/json',
        },
      }
    );
    
    chargeReceipt.result = {
      chargeId: response.data.data.id,
      code: response.data.data.code,
      hostedUrl: response.data.data.hosted_url,
      expiresAt: response.data.data.expires_at,
      addresses: response.data.data.addresses,
    };
    
    // Store idempotency key
    await storeIdempotencyKey(idempotencyKey, chargeReceipt);
    
  } catch (error) {
    console.error('[CoinbaseCommerce] Charge creation failed:', error);
    chargeReceipt.error = error.response?.data?.error?.message || error.message;
    throw error;
  } finally {
    await writeArtifact('coinbaseCharge', chargeReceipt);
  }
  
  return chargeReceipt.result;
}

// Verify Coinbase webhook signature
function verifyWebhook(payload, signature) {
  const crypto = require('node:crypto');
  const computedSignature = crypto
    .createHmac('sha256', process.env.COINBASE_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (computedSignature !== signature) {
    throw new Error('Invalid webhook signature');
  }
  
  return JSON.parse(payload);
}

module.exports = {
  createCharge,
  verifyWebhook,
};

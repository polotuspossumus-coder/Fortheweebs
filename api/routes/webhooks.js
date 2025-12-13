// routes/webhooks.js - Stripe and Coinbase webhook handlers
const express = require('express');
const router = express.Router();
const { verifyWebhook: verifyStripe } = require('../payments/stripe-connect');
const { verifyWebhook: verifyCoinbase } = require('../payments/coinbase-commerce');
const { writeArtifact } = require('../../utils/server-safety');

// Stripe webhook (requires raw body)
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    const event = verifyStripe(req.body, signature);
    
    const webhookReceipt = {
      timestamp: new Date().toISOString(),
      provider: 'stripe',
      eventType: event.type,
      eventId: event.id,
      data: event.data.object,
    };
    
    // Handle different event types
    switch (event.type) {
      case 'transfer.created':
      case 'transfer.updated':
      case 'transfer.paid':

        break;
        
      case 'account.updated':

        break;
        
      default:

    }
    
    await writeArtifact('stripeWebhook', webhookReceipt);
    
    res.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Stripe verification failed:', error);
    res.status(400).json({ error: 'Webhook verification failed' });
  }
});

// Coinbase Commerce webhook (requires raw body)
router.post('/coinbase', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-cc-webhook-signature'];
  
  try {
    const event = verifyCoinbase(req.body.toString(), signature);
    
    const webhookReceipt = {
      timestamp: new Date().toISOString(),
      provider: 'coinbase',
      eventType: event.type,
      eventId: event.id,
      data: event.data,
    };
    
    // Handle different event types
    switch (event.type) {
      case 'charge:confirmed':

        break;
        
      case 'charge:failed':

        break;
        
      case 'charge:pending':

        break;
        
      default:

    }
    
    await writeArtifact('coinbaseWebhook', webhookReceipt);
    
    res.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Coinbase verification failed:', error);
    res.status(400).json({ error: 'Webhook verification failed' });
  }
});

module.exports = router;

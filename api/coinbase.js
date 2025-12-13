/**
 * Crypto Payment API
 * Handles cryptocurrency payments for tier purchases
 * Supports BTC, ETH, USDC, USDT
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

// Crypto price IDs (for future integration with Coinbase Commerce or similar)
const CRYPTO_PRICES = {
    elite: { usd: 1000, btc: null, eth: null },
    vip: { usd: 500, btc: null, eth: null },
    premium: { usd: 250, btc: null, eth: null },
    enhanced: { usd: 100, btc: null, eth: null },
    standard: { usd: 50, btc: null, eth: null }
};

/**
 * Create Crypto Payment Intent
 * POST /api/crypto-payment/create
 */
router.post('/create', async (req, res) => {
    try {
        const { tier, currency = 'BTC' } = req.body;

        if (!userId || !tier) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!CRYPTO_PRICES[tier]) {
            return res.status(400).json({ error: 'Invalid tier' });
        }

        // Generate unique payment ID
        const paymentId = `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store payment intent in database
        const { error } = await supabase
            .from('crypto_payments')
            .insert({
                payment_id: paymentId,
                user_id: userId,
                tier: tier,
                amount_usd: CRYPTO_PRICES[tier].usd,
                currency: currency,
                status: 'pending',
                created_at: new Date().toISOString()
            });

        if (error) throw error;

        // In production, integrate with Coinbase Commerce, BTCPay Server, or similar
        res.json({
            paymentId: paymentId,
            tier: tier,
            amount: CRYPTO_PRICES[tier].usd,
            currency: currency,
            // Mock payment address for now
            address: `mock-${currency.toLowerCase()}-address-${paymentId}`,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min expiry
        });

    } catch (error) {
        console.error('Crypto payment creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check Crypto Payment Status
 * GET /api/crypto-payment/status/:paymentId
 */
router.get('/status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        const { data: payment, error } = await supabase
            .from('crypto_payments')
            .select('*')
            .eq('payment_id', paymentId)
            .single();

        if (error) throw error;

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json({
            paymentId: payment.payment_id,
            status: payment.status,
            tier: payment.tier,
            amount: payment.amount_usd,
            currency: payment.currency,
            confirmedAt: payment.confirmed_at
        });

    } catch (error) {
        console.error('Crypto payment status error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Crypto Payment Webhook (for Coinbase Commerce, BTCPay, etc.)
 * POST /api/crypto-payment/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        // Webhook signature verification ready - configure based on provider
        const event = req.body;


        // Handle confirmed payment
        if (event.type === 'charge:confirmed') {
            const paymentId = event.data.metadata.paymentId;

            // Get payment details
            const { data: payment, error: paymentError } = await supabase
                .from('crypto_payments')
                .select('*')
                .eq('payment_id', paymentId)
                .single();

            if (paymentError) throw paymentError;

            // Update payment status
            await supabase
                .from('crypto_payments')
                .update({
                    status: 'confirmed',
                    confirmed_at: new Date().toISOString()
                })
                .eq('payment_id', paymentId);

            // Upgrade user tier
            const { error: tierError } = await supabase
                .from('users')
                .update({
                    tier: payment.tier,
                    subscription_status: 'active',
                    payment_method: 'crypto',
                    updated_at: new Date().toISOString()
                })
                .eq('id', payment.user_id);

            if (tierError) throw tierError;


        }

        res.json({ received: true });

    } catch (error) {
        console.error('Crypto payment webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Supported Cryptocurrencies
 * GET /api/crypto-payment/currencies
 */
router.get('/currencies', (req, res) => {
    res.json({
        supported: [
            { symbol: 'BTC', name: 'Bitcoin', enabled: true },
            { symbol: 'ETH', name: 'Ethereum', enabled: true },
            { symbol: 'USDC', name: 'USD Coin', enabled: true },
            { symbol: 'USDT', name: 'Tether', enabled: true }
        ]
    });
});

module.exports = router;

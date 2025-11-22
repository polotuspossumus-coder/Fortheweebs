const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Your crypto wallet addresses (add these to .env)
const CRYPTO_WALLETS = {
    bitcoin: process.env.BITCOIN_WALLET_ADDRESS || 'YOUR_BTC_ADDRESS_HERE',
    ethereum: process.env.ETHEREUM_WALLET_ADDRESS || 'YOUR_ETH_ADDRESS_HERE'
};

/**
 * Get Crypto Payment Info
 * POST /api/crypto/get-payment-info
 *
 * Returns wallet address and amount to send
 */
router.post('/get-payment-info', async (req, res) => {
    try {
        const {
            userId,
            productType, // 'subscription', 'tip', 'commission', 'unlock'
            amountUSD,
            crypto // 'bitcoin' or 'ethereum'
        } = req.body;

        if (!userId || !productType || !amountUSD || !crypto) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!['bitcoin', 'ethereum'].includes(crypto)) {
            return res.status(400).json({ error: 'Only Bitcoin and Ethereum accepted' });
        }

        // Get current crypto prices (in production, use a real API like CoinGecko)
        const cryptoPrices = {
            bitcoin: 45000, // Mock: $45k per BTC
            ethereum: 2500  // Mock: $2.5k per ETH
        };

        const cryptoAmount = (amountUSD / cryptoPrices[crypto]).toFixed(8);

        // Create payment request in database
        const paymentRequest = {
            id: `crypto_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            user_id: userId,
            product_type: productType,
            amount_usd: amountUSD,
            crypto_type: crypto,
            crypto_amount: parseFloat(cryptoAmount),
            wallet_address: CRYPTO_WALLETS[crypto],
            status: 'pending',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min expiry
        };

        const { error } = await supabase
            .from('crypto_payments')
            .insert(paymentRequest);

        if (error) {
            console.error('Error creating crypto payment:', error);
        }

        res.json({
            success: true,
            paymentId: paymentRequest.id,
            crypto: crypto,
            amountCrypto: cryptoAmount,
            amountUSD: amountUSD,
            walletAddress: CRYPTO_WALLETS[crypto],
            expiresAt: paymentRequest.expires_at,
            instructions: crypto === 'bitcoin'
                ? `Send exactly ${cryptoAmount} BTC to the address below`
                : `Send exactly ${cryptoAmount} ETH to the address below`,
            qrCode: `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${CRYPTO_WALLETS[crypto]}&choe=UTF-8`
        });

    } catch (error) {
        console.error('Crypto payment info error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Verify Crypto Payment (Manual verification for now)
 * POST /api/crypto/verify-payment
 *
 * In production, this would integrate with blockchain APIs to auto-verify
 */
router.post('/verify-payment', async (req, res) => {
    try {
        const {
            paymentId,
            txHash // Transaction hash from blockchain
        } = req.body;

        if (!paymentId || !txHash) {
            return res.status(400).json({ error: 'Payment ID and transaction hash required' });
        }

        // Get payment request
        const { data: payment } = await supabase
            .from('crypto_payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // In production, verify transaction on blockchain:
        // - Check transaction exists
        // - Verify amount matches
        // - Verify destination address
        // - Check confirmations

        // For now, mark as verified (you'll manually confirm)
        await supabase
            .from('crypto_payments')
            .update({
                status: 'pending_confirmation',
                tx_hash: txHash,
                verified_at: new Date().toISOString()
            })
            .eq('id', paymentId);

        res.json({
            success: true,
            message: 'Payment submitted for verification. You will be notified once confirmed.',
            status: 'pending_confirmation'
        });

    } catch (error) {
        console.error('Crypto verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Admin: Confirm Crypto Payment
 * POST /api/crypto/admin/confirm-payment
 *
 * Owner manually confirms payment after checking blockchain
 */
router.post('/admin/confirm-payment', async (req, res) => {
    try {
        const { paymentId, adminUserId } = req.body;

        // Verify admin is owner
        if (adminUserId !== process.env.OWNER_USER_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get payment
        const { data: payment } = await supabase
            .from('crypto_payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Mark as confirmed
        await supabase
            .from('crypto_payments')
            .update({
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
                confirmed_by: adminUserId
            })
            .eq('id', paymentId);

        // Grant access based on product type
        if (payment.product_type === 'subscription') {
            // Grant tier access
            await supabase
                .from('users')
                .update({
                    tier: payment.tier || 'full',
                    subscription_status: 'active',
                    subscription_type: 'crypto_onetime',
                    tier_updated_at: new Date().toISOString()
                })
                .eq('id', payment.user_id);
        }

        res.json({
            success: true,
            message: 'Payment confirmed and access granted'
        });

    } catch (error) {
        console.error('Crypto confirmation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Crypto Payment Status
 * GET /api/crypto/payment-status/:paymentId
 */
router.get('/payment-status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        const { data: payment } = await supabase
            .from('crypto_payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json({
            success: true,
            status: payment.status,
            amountUSD: payment.amount_usd,
            cryptoType: payment.crypto_type,
            cryptoAmount: payment.crypto_amount,
            txHash: payment.tx_hash,
            createdAt: payment.created_at,
            confirmedAt: payment.confirmed_at
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

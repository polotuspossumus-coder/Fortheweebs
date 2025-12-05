/**
 * Crypto Payment Intent API
 * 
 * Bitcoin: $1000 minimum (auto-converted to USD)
 * Ethereum: $2000 minimum (auto-converted to USD)
 * 
 * Upcharge is NON-NEGOTIABLE. We don't like crypto, but we'll help you offload it.
 */

import Stripe from 'stripe';

// This would typically use a crypto payment processor like:
// - Coinbase Commerce
// - BTCPay Server
// - NOWPayments
// - CoinGate
// For now, this is a reference implementation

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, unlockType, cryptoType, amount } = req.body;

        // Validate crypto type and minimum amounts
        const cryptoRules = {
            bitcoin: {
                minUSD: 1000,
                currency: 'BTC',
                message: 'Bitcoin minimum: $1000 USD equivalent (reluctantly accepted)'
            },
            ethereum: {
                minUSD: 2000,
                currency: 'ETH',
                message: 'Ethereum minimum: $2000 USD equivalent (we don\'t like crypto, pay cash instead)'
            }
        };

        if (!cryptoRules[cryptoType]) {
            return res.status(400).json({
                error: 'Invalid crypto type. Only Bitcoin and Ethereum accepted (reluctantly).'
            });
        }

        const rules = cryptoRules[cryptoType];

        if (amount < rules.minUSD) {
            return res.status(400).json({
                error: `${rules.message}. Current amount: $${amount}`,
                minRequired: rules.minUSD
            });
        }

        // In production, integrate with crypto payment processor
        // Example with Coinbase Commerce:
        /*
        const Commerce = require('coinbase-commerce-node');
        const Client = Commerce.Client;
        Client.init(process.env.COINBASE_COMMERCE_API_KEY);
        
        const Charge = Commerce.resources.Charge;
        const chargeData = {
          name: `ForTheWeebs ${unlockType} Unlock`,
          description: `Unlock ${unlockType} - ${rules.currency} payment (auto-converted to USD)`,
          local_price: {
            amount: amount.toFixed(2),
            currency: 'USD'
          },
          pricing_type: 'fixed_price',
          metadata: {
            userId: userId,
            unlockType: unlockType,
            cryptoType: cryptoType,
            platform: 'ForTheWeebs',
            autoConvert: true,
            feeWarning: 'Upcharge is NON-NEGOTIABLE'
          }
        };
    
        const charge = await Charge.create(chargeData);
        */

        // Simulated response for development
        const paymentIntent = {
            id: `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            unlockType,
            cryptoType,
            amountUSD: amount,
            currency: rules.currency,
            status: 'pending',
            hostedUrl: `https://commerce.coinbase.com/charges/DEMO_${Date.now()}`, // Demo URL
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
            addresses: {
                bitcoin: cryptoType === 'bitcoin' ? `bc1q${Math.random().toString(36).substr(2, 39)}` : null,
                ethereum: cryptoType === 'ethereum' ? `0x${Math.random().toString(16).substr(2, 40)}` : null
            },
            pricing: {
                local: { amount: amount.toFixed(2), currency: 'USD' },
                // In production, fetch real exchange rates
                [rules.currency.toLowerCase()]: {
                    amount: cryptoType === 'bitcoin'
                        ? (amount / 45000).toFixed(8) // Example BTC rate
                        : (amount / 2500).toFixed(8),  // Example ETH rate
                    currency: rules.currency
                }
            },
            warnings: [
                '⚠️ Upcharge is NON-NEGOTIABLE',
                '⚠️ Payment auto-converted to USD',
                '⚠️ Gas fees are your responsibility',
                '⚠️ We prefer cash/card - pay that instead'
            ],
            createdAt: new Date().toISOString()
        };

        // Log payment intent (in production, save to database)
        console.log('Crypto payment intent created:', paymentIntent);

        return res.status(200).json({
            success: true,
            paymentIntent,
            message: `${rules.currency} payment initiated. Please complete payment within 1 hour.`
        });

    } catch (error) {
        console.error('Crypto payment intent error:', error);
        return res.status(500).json({
            error: 'Failed to create crypto payment intent',
            message: error.message
        });
    }
}

/**
 * CCBill Webhook Handler
 * Processes adult content subscription payments via CCBill
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Verify CCBill webhook signature
 */
function verifyCCBillSignature(req) {
    const secret = process.env.CCBILL_WEBHOOK_SECRET;
    if (!secret) {
        console.warn('⚠️ CCBILL_WEBHOOK_SECRET not configured');
        return false;
    }

    const signature = req.headers['x-ccbill-signature'];
    const body = JSON.stringify(req.body);
    
    const hash = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    return signature === hash;
}

/**
 * Handle CCBill Webhook Events
 * POST /api/ccbill-webhook
 */
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        // Verify signature
        if (!verifyCCBillSignature(req)) {
            console.warn('⚠️ Invalid CCBill webhook signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const event = req.body;

        console.log('CCBill webhook received:', event.eventType);

        switch (event.eventType) {
            case 'NewSaleSuccess':
                await handleNewSale(event);
                break;
            
            case 'RenewalSuccess':
                await handleRenewal(event);
                break;
            
            case 'Cancellation':
                await handleCancellation(event);
                break;
            
            case 'Refund':
                await handleRefund(event);
                break;
            
            case 'Chargeback':
                await handleChargeback(event);
                break;
            
            default:
                console.log('Unhandled CCBill event:', event.eventType);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('CCBill webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Handle new subscription sale
 */
async function handleNewSale(event) {
    const { subscriptionId, userId, email, amount, currency } = event;

    // Update user tier to adult content
    const { error } = await supabase
        .from('users')
        .update({
            subscription_id: subscriptionId,
            subscription_status: 'active',
            adult_content_access: true,
            subscription_current_period_start: new Date().toISOString(),
            subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) {
        console.error('Failed to update user for new sale:', error);
        throw error;
    }

    console.log(`✅ New adult content subscription activated for user ${userId}`);
}

/**
 * Handle subscription renewal
 */
async function handleRenewal(event) {
    const { subscriptionId, userId } = event;

    const { error } = await supabase
        .from('users')
        .update({
            subscription_status: 'active',
            subscription_current_period_start: new Date().toISOString(),
            subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subscriptionId);

    if (error) {
        console.error('Failed to update user for renewal:', error);
        throw error;
    }

    console.log(`✅ Adult content subscription renewed for user ${userId}`);
}

/**
 * Handle subscription cancellation
 */
async function handleCancellation(event) {
    const { subscriptionId, userId } = event;

    const { error } = await supabase
        .from('users')
        .update({
            subscription_status: 'canceled',
            adult_content_access: false,
            updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subscriptionId);

    if (error) {
        console.error('Failed to update user for cancellation:', error);
        throw error;
    }

    console.log(`⚠️ Adult content subscription canceled for user ${userId}`);
}

/**
 * Handle refund
 */
async function handleRefund(event) {
    const { subscriptionId, userId, amount } = event;

    const { error } = await supabase
        .from('users')
        .update({
            subscription_status: 'canceled',
            adult_content_access: false,
            updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subscriptionId);

    if (error) {
        console.error('Failed to update user for refund:', error);
        throw error;
    }

    console.log(`💰 Refund processed for user ${userId}: ${amount}`);
}

/**
 * Handle chargeback
 */
async function handleChargeback(event) {
    const { subscriptionId, userId, amount } = event;

    const { error } = await supabase
        .from('users')
        .update({
            subscription_status: 'canceled',
            adult_content_access: false,
            account_status: 'flagged', // Flag for review
            updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subscriptionId);

    if (error) {
        console.error('Failed to update user for chargeback:', error);
        throw error;
    }

    console.log(`🚨 Chargeback received for user ${userId}: ${amount}`);
}

module.exports = router;

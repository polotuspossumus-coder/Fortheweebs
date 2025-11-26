/**
 * CCBill Webhook Handler
 * Processes payment confirmations, chargebacks, and refunds for adult content
 */

const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const router = express.Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.post('/', async (req, res) => {
  try {
    const webhookData = req.body;

    // Verify CCBill signature
    const isValid = verifyCCBillSignature(webhookData);
    if (!isValid) {
      console.error('Invalid CCBill signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process based on event type
    const result = await processWebhookEvent(webhookData);

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('CCBill webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
});

function verifyCCBillSignature(data) {
  const {
    subscription_id,
    timestamp,
    digest
  } = data;

  const salt = process.env.CCBILL_SALT;
  const string = `${subscription_id}${timestamp}${salt}`;
  const expectedDigest = crypto.createHash('md5').update(string).digest('hex');

  return digest === expectedDigest;
}

async function processWebhookEvent(data) {
  const eventType = data.eventType || data.type;

  switch (eventType) {
    case 'NewSaleSuccess':
    case 'approval':
      return await handlePaymentSuccess(data);

    case 'Chargeback':
      return await handleChargeback(data);

    case 'Refund':
      return await handleRefund(data);

    case 'Cancellation':
      return await handleCancellation(data);

    default:
      console.log('Unknown CCBill event:', eventType);
      return { processed: false, reason: 'Unknown event type' };
  }
}

async function handlePaymentSuccess(data) {
  const {
    subscription_id,
    transaction_id,
    user_id,
    content_id,
    amount,
    timestamp,
    email,
    accountingAmount, // Amount after CCBill fees
    accountingCurrency
  } = data;

  // Record transaction in database
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      transaction_id,
      subscription_id,
      user_id,
      content_id,
      amount: parseFloat(amount),
      net_amount: parseFloat(accountingAmount || amount),
      currency: accountingCurrency || 'USD',
      processor: 'ccbill',
      status: 'completed',
      type: 'adult_content_purchase',
      customer_email: email,
      created_at: new Date(timestamp * 1000).toISOString()
    })
    .select()
    .single();

  if (txError) {
    console.error('Failed to record transaction:', txError);
    throw new Error('Database error');
  }

  // Unlock content for user
  const { error: accessError } = await supabase
    .from('content_access')
    .insert({
      user_id,
      content_id,
      access_type: 'purchase',
      transaction_id,
      granted_at: new Date().toISOString(),
      expires_at: null // Permanent access
    });

  if (accessError) {
    console.error('Failed to grant access:', accessError);
  }

  // Calculate creator payout
  const netAmount = parseFloat(accountingAmount || amount);
  const platformFee = netAmount * 0.20; // 20% platform fee
  const creatorPayout = netAmount - platformFee;

  // Get content creator
  const { data: content } = await supabase
    .from('content')
    .select('creator_id')
    .eq('id', content_id)
    .single();

  if (content?.creator_id) {
    // Record creator earning
    await supabase
      .from('creator_earnings')
      .insert({
        creator_id: content.creator_id,
        transaction_id,
        amount: creatorPayout,
        platform_fee: platformFee,
        status: 'pending_payout',
        created_at: new Date().toISOString()
      });

    // Update creator balance
    await supabase.rpc('increment_creator_balance', {
      creator_id: content.creator_id,
      amount: creatorPayout
    });
  }

  // Send confirmation email to user
  await sendPurchaseConfirmation(email, content_id, amount);

  return {
    processed: true,
    transaction_id,
    access_granted: !accessError,
    payout_calculated: !!content?.creator_id
  };
}

async function handleChargeback(data) {
  const { transaction_id, subscription_id, user_id, content_id } = data;

  // Mark transaction as chargedback
  await supabase
    .from('transactions')
    .update({ status: 'chargedback', chargedback_at: new Date().toISOString() })
    .eq('transaction_id', transaction_id);

  // Revoke content access
  await supabase
    .from('content_access')
    .delete()
    .eq('transaction_id', transaction_id);

  // Reverse creator payout
  const { data: content } = await supabase
    .from('content')
    .select('creator_id')
    .eq('id', content_id)
    .single();

  if (content?.creator_id) {
    const { data: earning } = await supabase
      .from('creator_earnings')
      .select('amount')
      .eq('transaction_id', transaction_id)
      .single();

    if (earning) {
      // Deduct from creator balance
      await supabase.rpc('increment_creator_balance', {
        creator_id: content.creator_id,
        amount: -earning.amount
      });

      // Mark earning as reversed
      await supabase
        .from('creator_earnings')
        .update({ status: 'chargedback' })
        .eq('transaction_id', transaction_id);
    }
  }

  return { processed: true, access_revoked: true };
}

async function handleRefund(data) {
  const { transaction_id, subscription_id, amount } = data;

  // Mark transaction as refunded
  await supabase
    .from('transactions')
    .update({ status: 'refunded', refunded_at: new Date().toISOString() })
    .eq('transaction_id', transaction_id);

  // Optionally revoke access (depends on your policy)
  // await supabase.from('content_access').delete().eq('transaction_id', transaction_id);

  return { processed: true };
}

async function handleCancellation(data) {
  const { subscription_id, user_id } = data;

  // Mark subscription as cancelled
  await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('subscription_id', subscription_id);

  return { processed: true };
}

async function sendPurchaseConfirmation(email, contentId, amount) {
  // TODO: Implement email sending
  console.log(`Sending confirmation to ${email} for content ${contentId} ($${amount})`);
}

module.exports = router;

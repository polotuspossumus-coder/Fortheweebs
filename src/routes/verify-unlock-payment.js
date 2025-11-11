// Verify payment and unlock tool
// Called after successful Stripe payment

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentIntentId, userId, toolId } = req.body;

    if (!paymentIntentId || !userId || !toolId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }

    // Initialize Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Retrieve payment intent to verify it succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment not completed',
        status: paymentIntent.status
      });
    }

    // Verify the metadata matches
    if (paymentIntent.metadata.userId !== userId || paymentIntent.metadata.toolId !== toolId) {
      return res.status(400).json({
        error: 'Payment metadata mismatch'
      });
    }

    // TODO: Save unlock to database
    // For now, we'll let the frontend handle localStorage
    // In production, save to database here:
    /*
    const { data, error } = await supabase
      .from('tool_unlocks')
      .insert({
        user_id: userId,
        tool_id: toolId,
        payment_method: 'card',
        amount: paymentIntent.amount / 100,
        stripe_payment_intent_id: paymentIntentId,
        unlocked_at: new Date().toISOString()
      });
    */

    return res.status(200).json({
      success: true,
      message: 'Tool unlocked successfully',
      toolId,
      userId,
      amount: paymentIntent.amount / 100
    });
  } catch (error) {
    console.error('Unlock verification error:', error);
    return res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
}

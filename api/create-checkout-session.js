let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch {
  stripe = null;
}

module.exports = async (req, res) => {
  if (!stripe) {
    res.status(500).json({ error: 'Stripe library not loaded' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { amount } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Fortheweebs Payment' },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.STRIPE_SUCCESS_URL || 'https://fortheweebs.vercel.app/success',
      cancel_url: process.env.STRIPE_CANCEL_URL || 'https://fortheweebs.vercel.app/cancel',
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    let msg = 'Unknown error';
    if (err && typeof err === 'object' && err !== null && 'message' in err) {
      msg = String(err.message);
    } else if (typeof err === 'string') {
      msg = err;
    } else {
      msg = String(err);
    }
    res.status(500).json({ error: msg });
  }
};

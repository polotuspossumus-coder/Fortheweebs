# 🎯 Stripe Pricing Setup Guide - ForTheWeebs

Complete guide to setting up your 6-tier pricing structure with Stripe.

---

## 📋 Pricing Structure

### Tier 1: Sovereign ($1000/mo) - LIMITED TO 1000 USERS
- **Everything unlocked**
- Super Admin powers (CGI effects, video calls, recording)
- VIP status + priority support
- Access to all future features
- **Stripe**: Recurring subscription with seat limit

### Tier 2: Full Unlock ($500/mo OR $500 one-time)
- All features except Super Admin powers
- No CGI video effects
- No video calls
- Everything else unlocked
- **Stripe**: Recurring OR one-time payment option

### Tier 3: Half Unlock ($250/mo)
- 50% of features
- Selected tools and capabilities
- **Stripe**: Recurring subscription

### Tier 4: Advanced ($100/mo)
- Advanced tool set
- More than Basic, less than Half
- **Stripe**: Recurring subscription

### Tier 5: Basic ($50/mo)
- Basic tool set
- Core features only
- **Stripe**: Recurring subscription

### Tier 6: Starter ($15 setup + $5/mo)
- Entry level
- $15 one-time setup fee
- $5/mo recurring
- **Stripe**: Subscription with setup fee

---

## 🛠️ Step 1: Create Products in Stripe Dashboard

### Go to: https://dashboard.stripe.com/products

### Product 1: Sovereign
```
Name: Sovereign Tier
Description: Full platform access with Super Admin powers and VIP status. Limited to 1000 users.

Price 1:
- Price: $1000.00
- Billing period: Monthly
- Price ID: (Copy this - e.g., price_1ABC123...)
```

### Product 2: Full Unlock (Subscription)
```
Name: Full Unlock (Monthly)
Description: Lifetime access to all features except Super Admin powers.

Price 1:
- Price: $500.00
- Billing period: Monthly
- Price ID: (Copy this)
```

### Product 3: Full Unlock (One-Time)
```
Name: Full Unlock (Lifetime)
Description: One-time payment for lifetime access to all features except Super Admin powers.

Price 1:
- Price: $500.00
- Billing period: One time
- Price ID: (Copy this)
```

### Product 4: Half Unlock
```
Name: Half Unlock
Description: Access to 50% of platform features.

Price 1:
- Price: $250.00
- Billing period: Monthly
- Price ID: (Copy this)
```

### Product 5: Advanced
```
Name: Advanced Tier
Description: Advanced tool set with expanded capabilities.

Price 1:
- Price: $100.00
- Billing period: Monthly
- Price ID: (Copy this)
```

### Product 6: Basic
```
Name: Basic Tier
Description: Basic tool set with core features.

Price 1:
- Price: $50.00
- Billing period: Monthly
- Price ID: (Copy this)
```

### Product 7: Starter
```
Name: Starter Tier
Description: Entry-level access with basic tools.

Price 1:
- Price: $5.00
- Billing period: Monthly
- Setup fee: $15.00 (see setup instructions below)
- Price ID: (Copy this)
```

**Note**: For setup fees in Stripe, you need to add it as part of the checkout session creation (see implementation below).

---

## 🔧 Step 2: Limit Sovereign Tier to 1000 Users

Stripe doesn't have built-in seat limits, so we handle it in code:

### Implementation in `api/stripe.js`:

```javascript
// Check Sovereign tier availability before checkout
router.post('/check-sovereign-availability', async (req, res) => {
  try {
    // Count current Sovereign subscribers in your database
    const { data: sovereignUsers, error } = await supabase
      .from('users')
      .select('id')
      .eq('tier', 'sovereign')
      .eq('subscription_status', 'active');

    if (error) throw error;

    const currentCount = sovereignUsers?.length || 0;
    const available = currentCount < 1000;

    res.json({
      available,
      currentCount,
      maxCount: 1000,
      spotsRemaining: 1000 - currentCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Add to frontend before Sovereign checkout:

```javascript
// Check availability first
const checkSovereignAvailability = async () => {
  const response = await fetch('/api/check-sovereign-availability');
  const { available, spotsRemaining } = await response.json();

  if (!available) {
    alert('Sovereign tier is currently full (1000/1000). Please try Full Unlock instead.');
    return false;
  }

  // Show urgency
  if (spotsRemaining < 100) {
    alert(`Only ${spotsRemaining} Sovereign spots remaining!`);
  }

  return true;
};
```

---

## 💳 Step 3: Update Checkout Session Creation

### File: `api/stripe.js`

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Updated checkout endpoint
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { tier, userId, email, oneTime = false } = req.body;

    // Define price IDs (replace with your actual IDs from Stripe dashboard)
    const priceIds = {
      sovereign: 'price_1ABC123...', // $1000/mo
      full_monthly: 'price_1DEF456...', // $500/mo
      full_lifetime: 'price_1GHI789...', // $500 one-time
      half: 'price_1JKL012...', // $250/mo
      advanced: 'price_1MNO345...', // $100/mo
      basic: 'price_1PQR678...', // $50/mo
      starter: 'price_1STU901...' // $5/mo
    };

    // Check Sovereign availability
    if (tier === 'sovereign') {
      const availCheck = await fetch(`${process.env.API_URL}/api/check-sovereign-availability`);
      const { available } = await availCheck.json();

      if (!available) {
        return res.status(400).json({
          error: 'Sovereign tier is full',
          message: 'All 1000 Sovereign spots are taken. Please select Full Unlock instead.'
        });
      }
    }

    // Determine price ID
    let priceId;
    if (tier === 'full' && oneTime) {
      priceId = priceIds.full_lifetime;
    } else {
      priceId = priceIds[tier];
    }

    if (!priceId) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // Create checkout session
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: oneTime ? 'payment' : 'subscription',
      success_url: `${process.env.VITE_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/pricing`,
      client_reference_id: userId,
      customer_email: email,
      metadata: {
        userId,
        tier,
        oneTime: oneTime.toString()
      }
    };

    // Add setup fee for Starter tier
    if (tier === 'starter') {
      sessionConfig.line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Setup Fee',
            description: 'One-time setup fee for Starter tier'
          },
          unit_amount: 1500, // $15.00 in cents
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🎨 Step 4: Create Pricing Page UI

### File: `src/pages/PricingPage.jsx`

```javascript
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PricingPage() {
  const [loading, setLoading] = useState(null);
  const [sovereignSpots, setSovereignSpots] = useState(null);

  // Check Sovereign availability on load
  useEffect(() => {
    fetch('/api/check-sovereign-availability')
      .then(r => r.json())
      .then(data => setSovereignSpots(data.spotsRemaining));
  }, []);

  const handleCheckout = async (tier, oneTime = false) => {
    setLoading(tier);

    try {
      const userId = localStorage.getItem('userId');
      const email = localStorage.getItem('userEmail');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, userId, email, oneTime })
      });

      const { sessionId, url, error } = await response.json();

      if (error) {
        alert(error);
        setLoading(null);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;

    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="pricing-page">
      <h1>Choose Your Tier</h1>

      {/* Tier 1: Sovereign */}
      <div className="tier-card sovereign">
        <div className="tier-badge">LIMITED EDITION</div>
        <h2>Sovereign</h2>
        <div className="price">$1,000<span>/month</span></div>
        <div className="spots-remaining">
          {sovereignSpots !== null && (
            <span className="urgent">
              Only {sovereignSpots} of 1000 spots remaining!
            </span>
          )}
        </div>
        <ul>
          <li>✅ EVERYTHING unlocked</li>
          <li>✅ Super Admin CGI effects (24 effects)</li>
          <li>✅ Video calls with effects</li>
          <li>✅ Recording & screen sharing</li>
          <li>✅ VIP status & priority support</li>
          <li>✅ Early access to new features</li>
          <li>✅ Your name on Sovereign wall</li>
        </ul>
        <button
          onClick={() => handleCheckout('sovereign')}
          disabled={loading === 'sovereign' || sovereignSpots === 0}
          className="btn-sovereign"
        >
          {loading === 'sovereign' ? 'Loading...' :
           sovereignSpots === 0 ? 'SOLD OUT' : 'Become Sovereign'}
        </button>
      </div>

      {/* Tier 2: Full Unlock */}
      <div className="tier-card full">
        <h2>Full Unlock</h2>
        <div className="price-options">
          <div className="price-option">
            <div className="price">$500<span>/month</span></div>
            <button
              onClick={() => handleCheckout('full_monthly')}
              disabled={loading === 'full_monthly'}
            >
              {loading === 'full_monthly' ? 'Loading...' : 'Subscribe Monthly'}
            </button>
          </div>
          <div className="price-option">
            <div className="price">$500<span> lifetime</span></div>
            <button
              onClick={() => handleCheckout('full', true)}
              disabled={loading === 'full_lifetime'}
              className="btn-lifetime"
            >
              {loading === 'full_lifetime' ? 'Loading...' : 'Buy Lifetime Access'}
            </button>
          </div>
        </div>
        <ul>
          <li>✅ All features (except Super Admin)</li>
          <li>✅ Mico AI assistant</li>
          <li>✅ 12 effect presets</li>
          <li>✅ Advanced tools</li>
          <li>❌ No CGI video effects</li>
          <li>❌ No video calls</li>
        </ul>
      </div>

      {/* Tier 3: Half Unlock */}
      <div className="tier-card half">
        <h2>Half Unlock</h2>
        <div className="price">$250<span>/month</span></div>
        <ul>
          <li>✅ 50% of features</li>
          <li>✅ Mico AI assistant (limited)</li>
          <li>✅ 6 effect presets</li>
          <li>✅ Basic CGI effects (12 effects)</li>
          <li>❌ No video calls</li>
        </ul>
        <button
          onClick={() => handleCheckout('half')}
          disabled={loading === 'half'}
        >
          {loading === 'half' ? 'Loading...' : 'Get Half Unlock'}
        </button>
      </div>

      {/* Tier 4: Advanced */}
      <div className="tier-card advanced">
        <h2>Advanced</h2>
        <div className="price">$100<span>/month</span></div>
        <ul>
          <li>✅ Advanced tool set</li>
          <li>✅ Mico AI (basic)</li>
          <li>✅ 3 effect presets</li>
          <li>✅ 6 CGI effects</li>
        </ul>
        <button
          onClick={() => handleCheckout('advanced')}
          disabled={loading === 'advanced'}
        >
          {loading === 'advanced' ? 'Loading...' : 'Get Advanced'}
        </button>
      </div>

      {/* Tier 5: Basic */}
      <div className="tier-card basic">
        <h2>Basic</h2>
        <div className="price">$50<span>/month</span></div>
        <ul>
          <li>✅ Basic tool set</li>
          <li>✅ 3 CGI effects</li>
          <li>✅ Recording</li>
        </ul>
        <button
          onClick={() => handleCheckout('basic')}
          disabled={loading === 'basic'}
        >
          {loading === 'basic' ? 'Loading...' : 'Get Basic'}
        </button>
      </div>

      {/* Tier 6: Starter */}
      <div className="tier-card starter">
        <h2>Starter</h2>
        <div className="price">
          $15 <span className="setup">setup</span> + $5<span>/month</span>
        </div>
        <ul>
          <li>✅ Entry-level access</li>
          <li>✅ 1 CGI effect</li>
          <li>✅ Basic tools</li>
        </ul>
        <button
          onClick={() => handleCheckout('starter')}
          disabled={loading === 'starter'}
        >
          {loading === 'starter' ? 'Loading...' : 'Get Started'}
        </button>
      </div>

      <style jsx>{`
        .pricing-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        h1 {
          text-align: center;
          font-size: 3rem;
          margin-bottom: 40px;
        }

        .tier-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          position: relative;
        }

        .tier-card.sovereign {
          border: 3px solid gold;
          background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
        }

        .tier-badge {
          position: absolute;
          top: -12px;
          right: 20px;
          background: gold;
          color: #000;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .price {
          font-size: 3rem;
          font-weight: bold;
          color: #667eea;
          margin: 16px 0;
        }

        .price span {
          font-size: 1.2rem;
          color: #6c757d;
          font-weight: normal;
        }

        .price-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin: 20px 0;
        }

        .spots-remaining {
          background: #fee;
          border: 2px solid #c33;
          padding: 12px;
          border-radius: 8px;
          margin: 16px 0;
        }

        .urgent {
          color: #c33;
          font-weight: bold;
          font-size: 1.1rem;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 24px 0;
        }

        li {
          padding: 8px 0;
          font-size: 1.1rem;
        }

        button {
          width: 100%;
          padding: 16px;
          font-size: 1.1rem;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        button:hover:not(:disabled) {
          transform: scale(1.05);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-sovereign {
          background: linear-gradient(135deg, gold 0%, #ffd700 100%);
          color: #000;
        }

        .btn-lifetime {
          background: #28a745;
          color: white;
        }
      `}</style>
    </div>
  );
}
```

---

## 🔔 Step 5: Handle Webhook for Tier Assignment

### Update `api/stripe.js` webhook handler:

```javascript
router.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, tier, oneTime } = session.metadata;

        // Update user tier in database
        const { error } = await supabase
          .from('users')
          .update({
            tier: tier,
            subscription_status: 'active',
            subscription_id: session.subscription || session.id,
            subscription_type: oneTime === 'true' ? 'lifetime' : 'recurring',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;

        console.log(`✅ User ${userId} upgraded to ${tier}`);

        // If Sovereign, check if we hit 1000 limit
        if (tier === 'sovereign') {
          const { data } = await supabase
            .from('users')
            .select('id')
            .eq('tier', 'sovereign')
            .eq('subscription_status', 'active');

          if (data?.length >= 1000) {
            console.log('🚨 SOVEREIGN TIER FULL (1000/1000)');
            // Optionally: Send alert, update status page, etc.
          }
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        // Find user by subscription ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('subscription_id', subscription.id)
          .single();

        if (user) {
          // Downgrade to free
          await supabase
            .from('users')
            .update({
              tier: 'free',
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          console.log(`❌ User ${user.id} downgraded to free`);
        }

        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
```

---

## 🎯 Step 6: Feature Access Control

### File: `src/utils/tierFeatures.js`

```javascript
/**
 * Define what each tier can access
 */
export const TIER_FEATURES = {
  sovereign: {
    cgi_effects: true,
    cgi_effect_count: 24,
    video_calls: true,
    recording: true,
    screen_sharing: true,
    mico_ai: true,
    mico_commands: 'unlimited',
    presets: 12,
    priority_support: true,
    vip_status: true,
    custom_branding: true,
    api_access: true,
    analytics: true
  },

  full_monthly: {
    cgi_effects: false,
    video_calls: false,
    recording: true,
    mico_ai: true,
    mico_commands: 1000,
    presets: 12,
    priority_support: true,
    custom_branding: true,
    api_access: true,
    analytics: true
  },

  full_lifetime: {
    cgi_effects: false,
    video_calls: false,
    recording: true,
    mico_ai: true,
    mico_commands: 'unlimited',
    presets: 12,
    custom_branding: true,
    api_access: true,
    analytics: true
  },

  half: {
    cgi_effects: true,
    cgi_effect_count: 12,
    video_calls: false,
    recording: true,
    mico_ai: true,
    mico_commands: 500,
    presets: 6,
    custom_branding: false,
    analytics: true
  },

  advanced: {
    cgi_effects: true,
    cgi_effect_count: 6,
    video_calls: false,
    recording: true,
    mico_ai: true,
    mico_commands: 200,
    presets: 3,
    analytics: false
  },

  basic: {
    cgi_effects: true,
    cgi_effect_count: 3,
    video_calls: false,
    recording: true,
    mico_ai: false,
    presets: 0
  },

  starter: {
    cgi_effects: true,
    cgi_effect_count: 1,
    video_calls: false,
    recording: false,
    mico_ai: false,
    presets: 0
  },

  free: {
    cgi_effects: false,
    video_calls: false,
    recording: false,
    mico_ai: false
  }
};

/**
 * Check if user has access to feature
 */
export function hasFeature(tier, feature) {
  return TIER_FEATURES[tier]?.[feature] === true;
}

/**
 * Get feature limit
 */
export function getFeatureLimit(tier, feature) {
  return TIER_FEATURES[tier]?.[feature] || 0;
}
```

### Usage in components:

```javascript
import { hasFeature, getFeatureLimit } from './utils/tierFeatures';

function CGIControls({ userTier }) {
  const canUseCGI = hasFeature(userTier, 'cgi_effects');
  const effectLimit = getFeatureLimit(userTier, 'cgi_effect_count');

  if (!canUseCGI) {
    return (
      <div className="upgrade-prompt">
        <h3>CGI Effects require Basic tier or higher</h3>
        <button onClick={() => navigate('/pricing')}>
          Upgrade Now
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>Available effects: {effectLimit}</p>
      {/* Show only allowed effects */}
    </div>
  );
}
```

---

## 📱 Step 7: Add "Pay As You Go" Option

For users who want to unlock Full tier without subscription:

### Add endpoint:

```javascript
// api/stripe.js
router.post('/create-payg-checkout', async (req, res) => {
  try {
    const { userId, email, credits } = req.body;

    // Define credit packages
    const creditPrices = {
      10: 'price_10_credits', // $50 for 10 credits
      50: 'price_50_credits', // $200 for 50 credits (20% discount)
      100: 'price_100_credits' // $350 for 100 credits (30% discount)
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: creditPrices[credits],
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.VITE_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/pricing`,
      metadata: { userId, type: 'credits', credits }
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## ✅ Step 8: Testing Checklist

Before going live:

- [ ] Test each tier checkout in Stripe test mode
- [ ] Verify webhook triggers correctly
- [ ] Check Sovereign limit (try to purchase 1001st spot - should fail)
- [ ] Test subscription cancellation
- [ ] Test one-time payment for Full Unlock
- [ ] Verify Starter tier setup fee appears
- [ ] Check feature access gates work per tier
- [ ] Test "spots remaining" counter updates

---

## 🚀 Next Steps

1. **Create all 7 products in Stripe Dashboard** (copy price IDs)
2. **Update `api/stripe.js`** with your actual price IDs
3. **Add PricingPage.jsx** to your routes
4. **Test in Stripe test mode** (use test card: 4242 4242 4242 4242)
5. **Deploy to production** when ready
6. **Monitor Sovereign tier** - announce when approaching 1000 limit

---

Want me to implement any specific part of this? I can:
- Write the complete database schema for tier tracking
- Create admin dashboard to monitor Sovereign spots
- Build upgrade/downgrade flow
- Add promo codes/coupons
- Implement referral system

Let me know what you need! 🔥

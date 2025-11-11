// PREMIUM SUBSCRIPTION - $5/month for adult content access + perks

import React, { useState } from 'react';
import './PremiumSubscription.css';

export function PremiumSubscription({ userId, currentTier }) {
  const [selectedTier, setSelectedTier] = useState('free');

  const tiers = {
    free: {
      name: 'Free',
      price: 0,
      color: '#64748b',
      features: [
        '✅ Browse all SFW content',
        '✅ Upload unlimited artwork',
        '✅ Basic portfolio',
        '✅ Participate in contests',
        '✅ Earn from print-on-demand (75/25 split)',
        '❌ No adult/NSFW content access',
        '❌ No commission marketplace',
        '❌ No priority support'
      ]
    },
    premium: {
      name: 'Premium',
      price: 5,
      color: '#8b5cf6',
      features: [
        '✅ Everything in Free',
        '🔞 Full adult/NSFW content access',
        '🔞 Create & sell adult content',
        '💼 Access commission marketplace',
        '⭐ Premium profile badge',
        '📊 Advanced analytics',
        '🎨 Exclusive premium-only contests',
        '🚀 Priority customer support',
        '💰 Better revenue split (80/20 instead of 75/25)',
        '🎁 Monthly free tips ($5 value)'
      ]
    }
  };

  const handleUpgrade = async (tier) => {
    if (tier === 'free') return;

    // In production: Create Stripe subscription
    /*
    const response = await fetch('/api/subscriptions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        tier,
        priceId: tier === 'premium' ? 'price_premium_monthly' : null
      })
    });

    const { clientSecret } = await response.json();
    
    // Redirect to Stripe Checkout
    const stripe = await loadStripe(process.env.STRIPE_PUBLIC_KEY);
    await stripe.redirectToCheckout({ sessionId: clientSecret });
    */

    alert(`🎉 Upgrading to ${tier}! (Stripe integration needed)`);
  };

  return (
    <div className="premium-subscription">
      <div className="premium-header">
        <h1>💎 Unlock Premium</h1>
        <p className="premium-subtitle">
          Get full access to adult content, commission marketplace, and premium features
        </p>
      </div>

      <div className="tiers-container">
        {/* Free Tier */}
        <div className="tier-card">
          <div className="tier-header" style={{borderColor: tiers.free.color}}>
            <h2 style={{color: tiers.free.color}}>{tiers.free.name}</h2>
            <div className="tier-price">
              <span className="price">${tiers.free.price}</span>
              <span className="period">/month</span>
            </div>
          </div>
          <div className="tier-features">
            {tiers.free.features.map((feature, idx) => (
              <div key={idx} className="feature-item">
                {feature}
              </div>
            ))}
          </div>
          <button className="tier-btn" style={{borderColor: tiers.free.color, color: tiers.free.color}} disabled>
            Current Plan
          </button>
        </div>

        {/* Premium Tier */}
        <div className="tier-card premium-card">
          <div className="popular-badge">⭐ MOST POPULAR</div>
          <div className="tier-header" style={{borderColor: tiers.premium.color}}>
            <h2 style={{color: tiers.premium.color}}>{tiers.premium.name}</h2>
            <div className="tier-price">
              <span className="price">${tiers.premium.price}</span>
              <span className="period">/month</span>
            </div>
            <p className="tier-tagline">🔞 Full adult content access + premium perks</p>
          </div>
          <div className="tier-features">
            {tiers.premium.features.map((feature, idx) => (
              <div key={idx} className="feature-item premium-feature">
                {feature}
              </div>
            ))}
          </div>
          <button 
            className="tier-btn premium-btn" 
            style={{background: `linear-gradient(135deg, ${tiers.premium.color}, #d946ef)`}}
            onClick={() => handleUpgrade('premium')}
          >
            🚀 Upgrade to Premium
          </button>
        </div>
      </div>

      <div className="premium-benefits">
        <h2>Why Go Premium?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🔞</div>
            <h3>Adult Content Access</h3>
            <p>Browse and create NSFW artwork, hentai, adult comics, and more. No censorship.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💼</div>
            <h3>Commission Marketplace</h3>
            <p>Offer custom commissions, get hired for projects. Platform only takes 15%.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💰</div>
            <h3>Better Revenue Split</h3>
            <p>80/20 split on print-on-demand instead of 75/25. Keep more of your earnings.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⭐</div>
            <h3>Premium Badge</h3>
            <p>Show off your premium status with a special badge on your profile.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📊</div>
            <h3>Advanced Analytics</h3>
            <p>Track views, engagement, revenue sources, audience demographics.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎁</div>
            <h3>Monthly Free Tips</h3>
            <p>Receive $5 in free tips to send to your favorite creators every month.</p>
          </div>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          <div className="faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>Yes! Cancel your subscription at any time. You'll keep premium access until the end of your billing period.</p>
          </div>
          <div className="faq-item">
            <h4>What happens if I cancel?</h4>
            <p>You'll revert to the free tier. Your account and content remain, but you'll lose access to adult content and premium features.</p>
          </div>
          <div className="faq-item">
            <h4>Can I upgrade/downgrade?</h4>
            <p>Yes! Changes take effect immediately. Prorated credits are applied automatically.</p>
          </div>
          <div className="faq-item">
            <h4>Is adult content age-verified?</h4>
            <p>Yes! You must verify you're 18+ via credit card or ID upload to access adult content. This is required by law.</p>
          </div>
        </div>
      </div>

      <div className="premium-cta">
        <h2>Ready to unlock everything?</h2>
        <p>Join thousands of premium creators earning more and accessing exclusive content.</p>
        <button className="btn-primary cta-btn" onClick={() => handleUpgrade('premium')}>
          🚀 Get Premium for $5/month
        </button>
        <p className="cta-disclaimer">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  );
}

// Premium badge component for profiles
export function PremiumBadge() {
  return (
    <span className="premium-badge-compact" title="Premium Member">
      ⭐ Premium
    </span>
  );
}

export default PremiumSubscription;

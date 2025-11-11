// TOOL UNLOCK SYSTEM - Earn-to-unlock model + $500 full platform access

import React, { useState } from 'react';
import './PremiumSubscription.css';

export function PremiumSubscription({ userId, currentTier, userBalance = 0 }) {
  const [selectedUnlock, setSelectedUnlock] = useState(null);

  const toolUnlocks = [
    { id: 'photo', name: '📸 Photo Tools Hub', price: 25, description: 'Advanced photo editing, filters, AI enhancement' },
    { id: 'design', name: '🎨 Graphic Design Studio', price: 50, description: 'Professional design tools, templates, exports' },
    { id: 'comics', name: '📚 Comic Book Creator', price: 75, description: 'Unlimited pages, premium templates, AI assistants' },
    { id: 'audio', name: '🎵 Audio Production Studio', price: 100, description: 'Music creation, sound effects, mixing tools' },
    { id: 'arvr', name: '🎭 AR/VR Studio', price: 200, description: '3D modeling, VR exports, AR filters' }
  ];

  const tiers = {
    free: {
      name: 'Free Tier',
      price: 0,
      color: '#64748b',
      features: [
        '✅ Browse all SFW content',
        '✅ Upload unlimited artwork',
        '✅ Basic portfolio',
        '✅ Earn from tips & commissions',
        '✅ Print-on-demand (75/25 split)',
        '✅ Basic tools (limited)',
        '❌ Advanced tools locked',
        '❌ No adult/NSFW content'
      ]
    },
    adult: {
      name: 'Adult Access',
      price: 5,
      isMonthly: true,
      color: '#ef4444',
      features: [
        '✅ Everything in Free',
        '🔞 Full adult/NSFW content access',
        '🔞 Create & sell adult content',
        '� Gore/violence/horror content',
        '⚠️ Tools still locked separately',
        '⚠️ One-time $500 unlock includes this'
      ]
    },
    full: {
      name: 'Full Platform Unlock',
      price: 500,
      color: '#fbbf24',
      features: [
        '✅ Everything in Free + Adult',
        '🔓 ALL tools unlocked forever',
        '🔞 Adult content included',
        '� Commission marketplace',
        '💰 Better revenue split (80/20)',
        '⭐ Premium profile badge',
        '📊 Advanced analytics',
        '🚀 Priority support',
        '🎁 Never pay monthly again'
      ]
    }
  };

  const handleUnlock = async (unlockType, price) => {
    if (userBalance < price) {
      alert(`❌ Insufficient balance. You need $${price} but only have $${userBalance}.\n\nEarn more from tips, commissions, or print sales!`);
      return;
    }

    // In production: Deduct from user's platform wallet
    /*
    const response = await fetch('/api/unlocks/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        unlockType,
        price,
        payFromBalance: true
      })
    });

    const result = await response.json();
    if (result.success) {
      // Update user's unlocked tools
    }
    */

    alert(`🎉 Unlocked! (Payment integration needed)\n\n$${price} will be deducted from your ForTheWeebs balance.`);
  };

  return (
    <div className="premium-subscription">
      <div className="premium-header">
        <h1>� Unlock Tools & Features</h1>
        <p className="premium-subtitle">
          Earn money on ForTheWeebs, then unlock tools from your balance. No credit card needed!
        </p>
        <div className="user-balance">
          💰 Your Balance: <strong>${userBalance.toFixed(2)}</strong>
        </div>
      </div>

      {/* TOOL UNLOCKS - Individual purchases */}
      <div className="tool-unlocks-section">
        <h2>🛠️ Unlock Tools Individually</h2>
        <p className="section-subtitle">Pay once, keep forever. Use your earnings!</p>
        <div className="tool-unlocks-grid">
          {toolUnlocks.map(tool => (
            <div key={tool.id} className="tool-unlock-card">
              <div className="tool-header">
                <h3>{tool.name}</h3>
                <div className="tool-price">${tool.price}</div>
              </div>
              <p className="tool-description">{tool.description}</p>
              <button
                className="unlock-btn"
                onClick={() => handleUnlock(tool.id, tool.price)}
                disabled={userBalance < tool.price}
              >
                {userBalance >= tool.price ? `🔓 Unlock for $${tool.price}` : `💰 Need $${(tool.price - userBalance).toFixed(2)} more`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* TIER COMPARISON */}
      <div className="tiers-container">
        {/* Free Tier */}
        <div className="tier-card">
          <div className="tier-header" style={{borderColor: tiers.free.color}}>
            <h2 style={{color: tiers.free.color}}>{tiers.free.name}</h2>
            <div className="tier-price">
              <span className="price">${tiers.free.price}</span>
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

        {/* Adult Access - $5/month */}
        <div className="tier-card adult-card">
          <div className="tier-header" style={{borderColor: tiers.adult.color}}>
            <h2 style={{color: tiers.adult.color}}>{tiers.adult.name}</h2>
            <div className="tier-price">
              <span className="price">${tiers.adult.price}</span>
              <span className="period">/month</span>
            </div>
            <p className="tier-tagline">🔞 Adult content ONLY (tools sold separately)</p>
          </div>
          <div className="tier-features">
            {tiers.adult.features.map((feature, idx) => (
              <div key={idx} className="feature-item">
                {feature}
              </div>
            ))}
          </div>
          <button
            className="tier-btn adult-btn"
            style={{background: `linear-gradient(135deg, ${tiers.adult.color}, #dc2626)`}}
            onClick={() => handleUnlock('adult_monthly', tiers.adult.price)}
          >
            🔞 Get Adult Access
          </button>
        </div>

        {/* Full Platform Unlock - $500 one-time */}
        <div className="tier-card full-unlock-card">
          <div className="popular-badge">⭐ BEST VALUE</div>
          <div className="tier-header" style={{borderColor: tiers.full.color}}>
            <h2 style={{color: tiers.full.color}}>{tiers.full.name}</h2>
            <div className="tier-price">
              <span className="price">${tiers.full.price}</span>
              <span className="period">one-time</span>
            </div>
            <p className="tier-tagline">🎉 Unlock EVERYTHING forever. No monthly fees!</p>
          </div>
          <div className="tier-features">
            {tiers.full.features.map((feature, idx) => (
              <div key={idx} className="feature-item full-feature">
                {feature}
              </div>
            ))}
          </div>
          <button
            className="tier-btn full-unlock-btn"
            style={{background: `linear-gradient(135deg, ${tiers.full.color}, #f59e0b)`}}
            onClick={() => handleUnlock('full_platform', tiers.full.price)}
            disabled={userBalance < tiers.full.price}
          >
            {userBalance >= tiers.full.price 
              ? `🚀 Unlock Everything for $${tiers.full.price}` 
              : `💰 Earn $${(tiers.full.price - userBalance).toFixed(2)} more to unlock`}
          </button>
          {userBalance < tiers.full.price && (
            <p className="unlock-tip">
              💡 Tip: Earn from tips, commissions, or print sales to reach $500!
            </p>
          )}
        </div>
      </div>

      <div className="premium-benefits">
        <h2>Why Earn-to-Unlock?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">�</div>
            <h3>Earn First, Pay Later</h3>
            <p>Start free, earn from tips/commissions/print sales, then unlock tools from your balance.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">�</div>
            <h3>One-Time Payments</h3>
            <p>No monthly subscriptions (except adult content). Unlock once, keep forever.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎯</div>
            <h3>Progressive Unlocks</h3>
            <p>Start with cheap tools ($25), work your way up to expensive AR/VR ($200).</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🚀</div>
            <h3>$500 = Everything</h3>
            <p>Full platform unlock includes ALL tools + adult content forever. Best deal.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💳</div>
            <h3>No Credit Card Needed</h3>
            <p>Pay from your ForTheWeebs earnings. Never come out of pocket.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>Crush Competitors</h3>
            <p>Patreon: 5-12% + monthly fees. Gumroad: 10% + $9/mo. We: 15-25% + $500 forever.</p>
          </div>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          <div className="faq-item">
            <h4>How do I earn money to unlock tools?</h4>
            <p>Earn from tips (0% fee), commissions (15% fee), and print-on-demand (25% fee). Your earnings go into your ForTheWeebs balance.</p>
          </div>
          <div className="faq-item">
            <h4>Can I pay with a credit card instead?</h4>
            <p>Yes! You can pay from your balance OR use a credit card. Your choice.</p>
          </div>
          <div className="faq-item">
            <h4>What if I only want adult content, not tools?</h4>
            <p>Adult content is $5/month separately. Or get it included in the $500 full unlock.</p>
          </div>
          <div className="faq-item">
            <h4>Do unlocks expire?</h4>
            <p>No! One-time payments last forever. Only adult content ($5/mo) is recurring.</p>
          </div>
          <div className="faq-item">
            <h4>What's the best deal?</h4>
            <p>$500 full unlock = ALL tools + adult content forever. Buying individually costs $450+ tools + $60/year adult = way more.</p>
          </div>
        </div>
      </div>

      <div className="premium-cta">
        <h2>Ready to unlock everything?</h2>
        <p>Start earning today. Unlock tools as you grow. No monthly fees (except adult content).</p>
        <button 
          className="btn-primary cta-btn" 
          onClick={() => handleUnlock('full_platform', tiers.full.price)}
          disabled={userBalance < tiers.full.price}
        >
          {userBalance >= tiers.full.price 
            ? `🚀 Unlock Everything for $${tiers.full.price}` 
            : `💰 Earn $${(tiers.full.price - userBalance).toFixed(2)} more`}
        </button>
        <p className="cta-disclaimer">One-time payment. No monthly fees. Keep forever.</p>
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

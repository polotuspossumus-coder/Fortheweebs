// TOOL UNLOCK SYSTEM - Earn-to-unlock model + $500 full platform access

import React, { useState, useEffect } from 'react';
import './PremiumSubscription.css';
import { unlockTool, getUserBalance, deductBalance, TOOL_PRICES } from '../utils/toolUnlockSystem';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (will be null if env var not set)
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

export function PremiumSubscription({ userId, currentTier }) {
  const [selectedUnlock, setSelectedUnlock] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const balance = getUserBalance(userId);
    setUserBalance(balance);
  }, [userId]);

  const toolUnlocks = [
    { id: 'photo', name: '📸 Photo Tools Hub', price: 25, description: 'Advanced photo editing, filters, AI enhancement' },
    { id: 'design', name: '🎨 Graphic Design Studio', price: 50, description: 'Professional design tools, templates, exports' },
    { id: 'comics', name: '📚 Comic Book Creator', price: 75, description: 'Unlimited pages, premium templates, AI assistants' },
    { id: 'audio', name: '🎵 Audio Production Studio', price: 100, description: 'Music creation, sound effects, mixing tools' },
    { id: 'cgi', name: '🎬 CGI Content Studio', price: 200, description: 'CGI video generation, 3D rendering, scene creation' },
    { id: 'ai', name: '🤖 AI Content Studio', price: 200, description: 'AI voice synthesis, character recognition, auto-generation' },
    { id: 'arvr', name: '🎭 AR/VR Studio', price: 500, description: '3D modeling, VR exports, AR filters, metaverse content' }
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
        '💪 Commission marketplace',
        '💰 Better revenue split (80/20)',
        '⭐ Premium profile badge',
        '📊 Advanced analytics',
        '🚀 Priority support',
        '🎁 Never pay monthly again'
      ]
    },
    super_admin: {
      name: '🤫 Shhh... It\'s a Secret',
      price: 1000,
      color: '#8b5cf6',
      tagline: 'You won\'t be disappointed... Trust me.',
      features: [
        '✅ Everything in Full Platform',
        '� ZERO platform fees (0% instead of 15-25%)',
        '💰 Keep 100% of tips, commissions, and sales',
        '🧠 AI Character Recognition (anime ID)',
        '🤖 Train custom AI models on your datasets',
        '⚡ Auto-content generation with AI',
        '� Unlimited AI asset generation',
        '🎯 Experimental admin tools & features',
        '🤡 NFT minter (50% cut because NFTs are stupid)',
        '� First access to ALL future secret features',
        '👑 Exclusive "Secret Member" VIP badge',
        '💎 White-glove priority support (24/7)',
        '🚀 Beta features before public release',
        '📈 Advanced analytics & insights dashboard',
        '🎁 Lifetime grandfathered pricing (never pay more)',
        '❓ And many more undisclosed perks...'
      ]
    }
  };

  const handleUnlock = async (unlockType, price, paymentMethod = 'balance') => {
    if (processing) return; // Prevent double-clicks

    setProcessing(true);

    try {
      if (paymentMethod === 'balance') {
        if (userBalance < price) {
          alert(`❌ Insufficient balance. You need $${price} but only have $${userBalance}.\n\nOptions:\n1. Earn more from tips/commissions/print sales\n2. Pay with credit card instead`);
          return;
        }

        // Deduct from balance
        const success = deductBalance(userId, price);
        if (!success) {
          alert('❌ Payment failed. Please try again.');
          return;
        }

        // Unlock the tool
        const result = unlockTool(userId, unlockType, 'balance', price);
        if (result.success) {
          alert(`🎉 ${result.message}\n\nPaid from balance: $${price}\nRemaining balance: $${(userBalance - price).toFixed(2)}`);

          // Update balance display
          setUserBalance(userBalance - price);

          // Reload page to show unlocked tool
          setTimeout(() => window.location.reload(), 1500);
        } else {
          alert(`❌ ${result.message}`);
        }
      } else if (paymentMethod === 'card') {
        // Check if Stripe is configured
        const stripe = await stripePromise;

        if (!stripe || !import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
          alert(`💳 Stripe not configured yet.\n\nTo enable credit card payments:\n1. Get Stripe API keys from stripe.com\n2. Add to .env file:\n   VITE_STRIPE_PUBLIC_KEY=pk_test_...\n   STRIPE_SECRET_KEY=sk_test_...\n\nFor now, use "Pay from Balance" option.`);
          return;
        }

        try {
          // Create payment intent
          const response = await fetch('/api/create-unlock-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, toolId: unlockType, price })
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.message || 'Failed to create payment');
          }

          // Confirm payment with Stripe
          const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: {
              card: {
                // In production, use Stripe Elements for card input
                // For now, this will prompt Stripe's hosted payment UI
              }
            }
          });

          if (error) {
            alert(`❌ Payment failed: ${error.message}`);
            return;
          }

          if (paymentIntent.status === 'succeeded') {
            // Verify and unlock
            const verifyResponse = await fetch('/api/verify-unlock-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentIntentId: paymentIntent.id,
                userId,
                toolId: unlockType
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Unlock in localStorage (in production, this comes from database)
              const unlockResult = unlockTool(userId, unlockType, 'card', price);
              alert(`🎉 ${unlockResult.message}\n\nPaid via credit card: $${price}`);
              setTimeout(() => window.location.reload(), 1500);
            } else {
              alert(`❌ Verification failed: ${verifyData.message}`);
            }
          }
        } catch (error) {
          console.error('Payment error:', error);
          alert(`❌ Payment failed: ${error.message}\n\nPlease try again or use "Pay from Balance".`);
        }
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleSubscribe = async (tier) => {
    if (processing) return;

    setProcessing(true);

    try {
      // Check if Stripe is configured
      const stripe = await stripePromise;

      if (!stripe || !import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
        alert(`💳 Stripe not configured yet.\n\nTo enable subscriptions:\n1. Get Stripe API keys from stripe.com\n2. Add to .env file:\n   VITE_STRIPE_PUBLIC_KEY=pk_test_...\n   STRIPE_SECRET_KEY=sk_test_...\n   STRIPE_PRICE_ADULT=price_...\n   STRIPE_PRICE_UNLIMITED=price_...\n   STRIPE_PRICE_SUPER_ADMIN=price_...`);
        setProcessing(false);
        return;
      }

      // Prompt for email
      const email = prompt('Enter your email for subscription:');
      if (!email) {
        setProcessing(false);
        return;
      }

      // Create subscription
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tier, email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      // Confirm payment with Stripe
      const { error } = await stripe.confirmCardPayment(data.clientSecret);

      if (error) {
        alert(`❌ Subscription failed: ${error.message}`);
        return;
      }

      alert(`🎉 Subscription activated!\n\nTier: ${tier}\nYou now have full access to ${tier === 'adult' ? 'adult content' : tier === 'unlimited' ? 'unlimited features' : 'super admin perks'}!`);
      
      // Reload to show updated tier
      setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
      console.error('Subscription error:', error);
      alert(`❌ Subscription failed: ${error.message}\n\nPlease try again.`);
    } finally {
      setProcessing(false);
    }
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
              <div className="unlock-buttons">
                <button
                  className="unlock-btn balance-btn"
                  onClick={() => handleUnlock(tool.id, tool.price, 'balance')}
                  disabled={userBalance < tool.price || processing}
                >
                  {processing ? '⏳ Processing...' : userBalance >= tool.price ? `💰 Pay from Balance ($${tool.price})` : `Need $${(tool.price - userBalance).toFixed(2)} more`}
                </button>
                <button
                  className="unlock-btn card-btn"
                  onClick={() => handleUnlock(tool.id, tool.price, 'card')}
                  disabled={processing}
                >
                  {processing ? '⏳ Processing...' : `💳 Pay with Card ($${tool.price})`}
                </button>
                <button
                  className="unlock-btn crypto-btn"
                  onClick={() => handleUnlock(tool.id, tool.price, 'bitcoin')}
                  disabled={processing}
                  style={{ background: 'linear-gradient(135deg, #f7931a, #f2a900)', fontSize: '0.85rem' }}
                >
                  {processing ? '⏳ Processing...' : `₿ Bitcoin ($${Math.round(tool.price * 2)})`}
                </button>
                <button
                  className="unlock-btn crypto-btn"
                  onClick={() => handleUnlock(tool.id, tool.price, 'ethereum')}
                  disabled={processing}
                  style={{ background: 'linear-gradient(135deg, #627eea, #5a67d8)', fontSize: '0.85rem' }}
                >
                  {processing ? '⏳ Processing...' : `Ξ Ethereum ($${Math.round(tool.price * 4)})`}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TIER COMPARISON */}
      <div className="tiers-container">
        {/* Free Tier */}
        <div className="tier-card">
          <div className="tier-header" style={{ borderColor: tiers.free.color }}>
            <h2 style={{ color: tiers.free.color }}>{tiers.free.name}</h2>
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
          <button className="tier-btn" style={{ borderColor: tiers.free.color, color: tiers.free.color }} disabled>
            Current Plan
          </button>
        </div>

        {/* Adult Access - $5/month */}
        <div className="tier-card adult-card">
          <div className="tier-header" style={{ borderColor: tiers.adult.color }}>
            <h2 style={{ color: tiers.adult.color }}>{tiers.adult.name}</h2>
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
            style={{ background: `linear-gradient(135deg, ${tiers.adult.color}, #dc2626)` }}
            onClick={() => handleSubscribe('adult')}
            disabled={processing}
          >
            {processing ? '⏳ Processing...' : '🔞 Get Adult Access'}
          </button>
        </div>

        {/* Full Platform Unlock - $500 one-time */}
        <div className="tier-card full-unlock-card">
          <div className="popular-badge">⭐ BEST VALUE</div>
          <div className="tier-header" style={{ borderColor: tiers.full.color }}>
            <h2 style={{ color: tiers.full.color }}>{tiers.full.name}</h2>
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
            style={{ background: `linear-gradient(135deg, ${tiers.full.color}, #f59e0b)` }}
            onClick={() => handleUnlock('full_platform', tiers.full.price, 'balance')}
            disabled={userBalance < tiers.full.price}
          >
            {userBalance >= tiers.full.price
              ? `� Pay from Balance ($${tiers.full.price})`
              : `Need $${(tiers.full.price - userBalance).toFixed(2)} more`}
          </button>
          <button
            className="tier-btn full-unlock-btn"
            style={{ background: `linear-gradient(135deg, #10b981, #059669)`, marginTop: '0.5rem' }}
            onClick={() => handleUnlock('full_platform', tiers.full.price, 'card')}
          >
            💳 Pay with Card ($${tiers.full.price})
          </button>
          {userBalance < tiers.full.price && (
            <p className="unlock-tip">
              💡 Tip: Earn from tips, commissions, or print sales to reach $500!
            </p>
          )}
        </div>

        {/* Super Admin Powers - $1000 tier */}
        <div className="tier-card super-admin-card">
          <div className="secret-badge">🤫 SECRET TIER</div>
          <div className="tier-header" style={{ borderColor: tiers.super_admin.color }}>
            <h2 style={{ color: tiers.super_admin.color }}>{tiers.super_admin.name}</h2>
            <div className="tier-price">
              <span className="price">${tiers.super_admin.price}</span>
              <span className="period">one-time</span>
            </div>
            <p className="tier-tagline" style={{ color: tiers.super_admin.color }}>
              {tiers.super_admin.tagline}
            </p>
          </div>
          <div className="tier-features">
            {tiers.super_admin.features.map((feature, idx) => (
              <div key={idx} className="feature-item super-feature">
                {feature}
              </div>
            ))}

            {/* Only owner sees the real features */}
            {userId === 'owner' && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '10px',
                border: '2px solid #8b5cf6'
              }}>
                <div style={{ fontWeight: '700', marginBottom: '10px', color: '#8b5cf6' }}>
                  👑 OWNER VIEW - Real Features:
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  ✅ Never pay creator subscription fees<br />
                  ✅ AI Content Generation Powers<br />
                  ✅ Facial Recognition AI (anime character identification)<br />
                  ✅ Set AI to auto-generate content<br />
                  ✅ Train AI on your own datasets<br />
                  ✅ Admin-level tool access<br />
                  ✅ Custom AI models for your content
                </div>
              </div>
            )}
          </div>
          <button
            className="tier-btn super-admin-btn"
            style={{ background: `linear-gradient(135deg, ${tiers.super_admin.color}, #7c3aed)` }}
            onClick={() => handleUnlock('super_admin_powers', tiers.super_admin.price, 'balance')}
            disabled={userBalance < tiers.super_admin.price || processing}
          >
            {userBalance >= tiers.super_admin.price
              ? (processing ? '⏳ Processing...' : `🔥 Pay from Balance ($${tiers.super_admin.price})`)
              : `Need $${(tiers.super_admin.price - userBalance).toFixed(2)} more`}
          </button>
          <button
            className="tier-btn super-admin-btn"
            style={{ background: `linear-gradient(135deg, #ec4899, #db2777)`, marginTop: '0.5rem' }}
            onClick={() => handleSubscribe('super_admin')}
            disabled={processing}
          >
            {processing ? '⏳ Processing...' : `💳 Subscribe ($${tiers.super_admin.price}/month)`}
          </button>
          {userBalance < tiers.super_admin.price && (
            <p className="unlock-tip">
              💎 For serious creators who want superpowers
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

      {/* $500 vs $1000 Tier Comparison */}
      <div className="tier-comparison-section" style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: '20px',
        padding: '40px',
        marginBottom: '40px',
        border: '2px solid #8b5cf6'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          marginBottom: '15px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fbbf24 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>⚖️ $500 vs $1000: What's the Difference?</h2>
        <p style={{
          textAlign: 'center',
          fontSize: '1.1rem',
          color: '#999',
          marginBottom: '40px'
        }}>Is the $1000 tier worth 2x the price? Let's break it down.</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px'
        }}>
          {/* $500 Full Platform */}
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            padding: '30px',
            borderRadius: '15px',
            border: '2px solid #fbbf24'
          }}>
            <h3 style={{
              fontSize: '1.8rem',
              marginBottom: '10px',
              color: '#fbbf24'
            }}>🌟 $500 Full Platform</h3>
            <p style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              color: '#fbbf24',
              marginBottom: '20px'
            }}>Great for Creators</p>

            <div style={{ fontSize: '1.05rem', lineHeight: '2' }}>
              <div style={{ color: '#10b981' }}>✅ ALL tools unlocked</div>
              <div style={{ color: '#10b981' }}>✅ Adult content included</div>
              <div style={{ color: '#10b981' }}>✅ 80/20 revenue split</div>
              <div style={{ color: '#10b981' }}>✅ Premium badge</div>
              <div style={{ color: '#10b981' }}>✅ Priority support</div>
              <div style={{ color: '#10b981' }}>✅ Advanced analytics</div>
              <div style={{ color: '#ef4444', marginTop: '15px' }}>❌ Still pay 15-25% fees</div>
              <div style={{ color: '#ef4444' }}>❌ No AI character recognition</div>
              <div style={{ color: '#ef4444' }}>❌ No custom AI training</div>
              <div style={{ color: '#ef4444' }}>❌ No NFT minter</div>
              <div style={{ color: '#ef4444' }}>❌ No experimental features</div>
              <div style={{ color: '#ef4444' }}>❌ No future secret toys</div>
            </div>
          </div>

          {/* $1000 Super Admin Powers */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            padding: '30px',
            borderRadius: '15px',
            border: '3px solid #8b5cf6',
            boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '20px',
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '0.9rem'
            }}>🔥 BEST VALUE</div>

            <h3 style={{
              fontSize: '1.8rem',
              marginBottom: '10px',
              color: '#8b5cf6'
            }}>👑 $1000 Super Admin</h3>
            <p style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              color: '#8b5cf6',
              marginBottom: '20px'
            }}>For Power Users & Professionals</p>

            <div style={{ fontSize: '1.05rem', lineHeight: '2' }}>
              <div style={{ color: '#10b981' }}>✅ Everything in $500 tier</div>
              <div style={{ color: '#fbbf24', fontWeight: '700', fontSize: '1.15rem' }}>💰 ZERO PLATFORM FEES (0%!)</div>
              <div style={{ color: '#fbbf24', fontWeight: '700' }}>💵 Keep 100% of ALL earnings</div>
              <div style={{ color: '#8b5cf6', fontWeight: '700' }}>🧠 AI Character Recognition</div>
              <div style={{ color: '#8b5cf6', fontWeight: '700' }}>🤖 Train Custom AI Models</div>
              <div style={{ color: '#8b5cf6', fontWeight: '700' }}>⚡ Auto-Content Generation</div>
              <div style={{ color: '#8b5cf6', fontWeight: '700' }}>🎨 Unlimited AI Assets</div>
              <div style={{ color: '#8b5cf6', fontWeight: '700' }}>🤡 NFT Minter (50% cut)</div>
              <div style={{ color: '#8b5cf6', fontWeight: '700' }}>🔮 All Future Secret Features</div>
              <div style={{ color: '#8b5cf6', fontWeight: '700' }}>👑 Exclusive VIP Badge</div>
              <div style={{ color: '#8b5cf6', fontWeight: '700' }}>💎 White-Glove Support 24/7</div>
              <div style={{ color: '#8b5cf6', fontWeight: '700' }}>🚀 Beta Access to Everything</div>
              <div style={{ color: '#8b5cf6', fontWeight: '700' }}>🎁 Grandfathered Forever</div>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: 'rgba(251, 191, 36, 0.2)',
              borderRadius: '10px',
              border: '2px solid #fbbf24'
            }}>
              <p style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#fbbf24',
                marginBottom: '10px'
              }}>💡 ROI Calculation:</p>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#e0e0e0' }}>
                If you earn just <strong>$2000</strong> on ForTheWeebs:<br />
                • $500 tier: Pay <strong>$300-500 in fees</strong> (15-25%)<br />
                • $1000 tier: Pay <strong>$0 in fees</strong> (0%)<br />
                <span style={{ color: '#10b981', fontWeight: '700' }}>You break even immediately and save forever.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Summary */}
        <div style={{
          marginTop: '40px',
          padding: '30px',
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '15px',
          border: '2px dashed #8b5cf6',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '1.8rem',
            color: '#8b5cf6',
            marginBottom: '15px'
          }}>🎯 The Bottom Line</h3>
          <p style={{
            fontSize: '1.15rem',
            lineHeight: '1.8',
            color: '#e0e0e0',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <strong>$500 tier is perfect</strong> if you just want all the tools and don't mind paying standard platform fees.<br />
            <strong>$1000 tier pays for itself</strong> the moment you earn $2000+ because you keep 100% of everything.<br />
            Plus you get <strong>exclusive AI features, NFT minting, experimental tools, and lifetime VIP treatment</strong>.
          </p>
          <p style={{
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#fbbf24',
            marginTop: '20px'
          }}>
            For serious creators: $1000 tier = Infinite ROI 🚀
          </p>
        </div>
      </div>

      {/* Crypto & NFT Policy Section */}
      <div className="crypto-nft-policy" style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: '20px',
        padding: '40px',
        marginBottom: '40px',
        border: '2px solid #ff6b6b'
      }}>
        <h2 style={{
          fontSize: '2rem',
          marginBottom: '30px',
          textAlign: 'center',
          color: '#ff6b6b'
        }}>💰 Our Crypto & NFT Policy (The Honest Truth)</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px'
        }}>
          {/* Crypto Policy */}
          <div style={{
            background: 'rgba(255, 107, 107, 0.1)',
            padding: '25px',
            borderRadius: '15px',
            border: '2px solid #ff6b6b'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '15px',
              color: '#ffaa00'
            }}>Bitcoin & Ethereum (Reluctantly Accepted)</h3>

            <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
              Let's be real: <strong>Crypto is useful and we'll accept it if that's all you have</strong>,
              but we want USD period.
            </p>

            <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
              We <strong>only accept Bitcoin and Ethereum</strong> to help people offload crypto they want
              to convert. That's it.
            </p>

            <div style={{
              background: 'rgba(255, 0, 0, 0.2)',
              padding: '15px',
              borderRadius: '10px',
              marginTop: '15px',
              border: '2px solid #ff0000'
            }}>
              <p style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#ff6b6b',
                marginBottom: '10px'
              }}>⚠️ UPCHARGE IS NON-NEGOTIABLE</p>
              <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                <li><strong>$1000 in Bitcoin</strong> (auto-converted to USD)</li>
                <li><strong>$2000 in Ethereum</strong> (auto-converted to USD)</li>
              </ul>
              <p style={{ marginTop: '15px', fontStyle: 'italic', color: '#ffaa00' }}>
                💡 <strong>Pro tip:</strong> Pay with cash or credit card instead. We're upcharging because
                we want American USD.
              </p>
            </div>
          </div>

          {/* NFT Policy */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            padding: '25px',
            borderRadius: '15px',
            border: '2px solid #8b5cf6'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '15px',
              color: '#8b5cf6'
            }}>NFTs Are Stupid (But Available)</h3>

            <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
              <strong>We don't want anything to do with NFTs.</strong> They're stupid. Period.
            </p>

            <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
              But if some idiot wants to buy an NFT, <strong>we're certainly taking half</strong> because
              y'all are both idiots.
            </p>

            <div style={{
              background: 'rgba(139, 92, 246, 0.2)',
              padding: '15px',
              borderRadius: '10px',
              marginTop: '15px',
              border: '2px solid #8b5cf6'
            }}>
              <p style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#8b5cf6',
                marginBottom: '10px'
              }}>🤡 NFT Minter Details:</p>
              <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                <li>Tossed into the <strong>$1000 tier</strong> as a random tidbit</li>
                <li>Bundled with experimental admin toys</li>
                <li><strong>We take 50% of all NFT sales</strong></li>
                <li>No exceptions, no negotiations</li>
              </ul>
              <p style={{ marginTop: '15px', fontStyle: 'italic', color: '#8b5cf6' }}>
                This is why it's expensive. We don't want to deal with NFTs, but if you insist on being
                an idiot, we're getting paid.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '10px',
          border: '2px dashed #ff6b6b',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#ff6b6b',
            marginBottom: '10px'
          }}>
            🎯 The Bottom Line
          </p>
          <p style={{ lineHeight: '1.6', maxWidth: '800px', margin: '0 auto' }}>
            We're being brutally honest: <strong>Use cash or credit card</strong> for the best prices.
            Crypto is accepted to help people offload it and convert to USD, but it's premium priced. NFTs are stupid, but if you're
            into that nonsense, fine — just know we're taking our cut.
          </p>
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
            <p>Yes! Every unlock has TWO payment options: (1) Pay from your ForTheWeebs balance, OR (2) Pay with credit card. Your choice.</p>
          </div>
          <div className="faq-item">
            <h4>Can I pay in increments?</h4>
            <p>Yes! Unlock tools one by one ($25-$200 each) as you earn/afford them. Or save up and do the $500 full unlock at once.</p>
          </div>
          <div className="faq-item">
            <h4>Do I need to unlock tools to earn money?</h4>
            <p>No! You can earn from tips, commissions, and print-on-demand with the FREE tier. Use those earnings to unlock advanced tools.</p>
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

import React, { useState, useEffect } from 'react';
import {
  getPreferredCurrency,
  convertPrice,
  formatPrice,
  setPreferredCurrency,
  CURRENCY_CONFIG
} from './utils/currencyConverter';
import { t, getCurrentLanguage } from './utils/i18n';
import { LanguageSelector } from './components/LanguageSelector';

/**
 * PaymentModule - Tier selection and Stripe checkout with Multi-Currency Support
 * Offers $500 CREATOR tier and $1000 SUPER_ADMIN tier
 * Automatically shows prices in user's local currency (converted to USD on backend)
 */
export default function PaymentModule({ onPaymentComplete }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [userCurrency, setUserCurrency] = useState('USD');
  const [convertedPrices, setConvertedPrices] = useState({});
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  // Load user's currency preference and convert prices
  useEffect(() => {
    const loadCurrency = async () => {
      const currency = getPreferredCurrency();
      setUserCurrency(currency);

      // Convert all tier prices
      const prices = {};
      for (const tier of tiers) {
        if (tier.price > 0) {
          const converted = await convertPrice(tier.price, currency);
          prices[tier.id] = converted;
        }
      }
      setConvertedPrices(prices);
    };

    loadCurrency();
  }, [userCurrency]);

  const handleCurrencyChange = async (newCurrency) => {
    setUserCurrency(newCurrency);
    setPreferredCurrency(newCurrency);
    setShowCurrencySelector(false);

    // Re-convert prices
    const prices = {};
    for (const tier of tiers) {
      if (tier.price > 0) {
        const converted = await convertPrice(tier.price, newCurrency);
        prices[tier.id] = converted;
      }
    }
    setConvertedPrices(prices);
  };

  const getDisplayPrice = (tier) => {
    if (tier.price === 0) return '$0';
    if (userCurrency === 'USD') return `$${tier.price}`;

    const converted = convertedPrices[tier.id];
    if (!converted) return `$${tier.price}`;

    return formatPrice(converted, userCurrency);
  };

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Basic access to platform',
      features: [
        '✅ View content',
        '✅ Basic features',
        '✅ Community access',
        '❌ No creator tools',
        '❌ No AI features'
      ],
      color: '#888'
    },
    {
      id: 'CREATOR',
      name: 'Creator',
      price: 500,
      description: '100% profit + AR/VR tools',
      features: [
        '✅ Everything in Free',
        '🎨 AR/VR Content Studio',
        '📤 Cloud Upload (Unlimited)',
        '🎬 3D Model Viewer',
        '🌐 VR 360° Galleries',
        '💰 Keep 100% of your profits',
        '⚡ Priority support'
      ],
      color: '#667eea',
      popular: true
    },
    {
      id: 'SUPER_ADMIN',
      name: 'Super Admin',
      price: 1000,
      description: 'All features + AI superpowers',
      features: [
        '✅ Everything in Creator',
        '🤖 AI Content Generator',
        '🎨 DALL-E 3 Image Generation',
        '📝 GPT-4 Text Generation',
        '🎭 3D Model Generation',
        '🎬 Video Generation',
        '👁️ View all content FREE',
        '👑 Super Admin access',
        '⭐ VIP badge & perks',
        '🔓 Limited to 100 spots'
      ],
      color: '#FFD700',
      premium: true
    }
  ];

  const handleCheckout = async (tier) => {
    if (tier.id === 'free') {
      if (onPaymentComplete) {
        onPaymentComplete('FREE');
      }
      return;
    }

    setSelectedTier(tier.id);
    setProcessing(true);
    setError(null);

    try {
      // Call your backend to create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tier: tier.id,
          price: tier.price, // Always send USD price to backend
          priceUSD: tier.price,
          displayCurrency: userCurrency,
          displayPrice: convertedPrices[tier.id],
          successUrl: `${window.location.origin}/success?tier=${tier.id}`,
          cancelUrl: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();

      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div style={{
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Choose Your Tier
        </h1>

        <p style={{
          textAlign: 'center',
          fontSize: '1.2rem',
          marginBottom: '30px',
          opacity: 0.9
        }}>
          Unlock your creative potential with ForTheWeebs
        </p>

        {/* Language and Currency Selectors */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <LanguageSelector />

          <button
            onClick={() => setShowCurrencySelector(!showCurrencySelector)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '10px',
              padding: '10px 20px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>💱</span>
            <span>{CURRENCY_CONFIG[userCurrency]?.symbol || '$'} {userCurrency}</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
          </button>
        </div>

        {/* Currency Selector */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>

          {showCurrencySelector && (
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#1a1a2e',
              border: '2px solid #667eea',
              borderRadius: '15px',
              padding: '30px',
              zIndex: 1000,
              maxHeight: '70vh',
              overflowY: 'auto',
              maxWidth: '600px',
              width: '90%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Select Your Currency</h3>
                <button
                  onClick={() => setShowCurrencySelector(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '10px'
              }}>
                {Object.entries(CURRENCY_CONFIG).map(([code, config]) => (
                  <button
                    key={code}
                    onClick={() => handleCurrencyChange(code)}
                    style={{
                      background: userCurrency === code ? '#667eea' : 'rgba(255,255,255,0.1)',
                      border: userCurrency === code ? '2px solid #764ba2' : '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (userCurrency !== code) {
                        e.target.style.background = 'rgba(102, 126, 234, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (userCurrency !== code) {
                        e.target.style.background = 'rgba(255,255,255,0.1)';
                      }
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {config.symbol} {code}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                      {config.name}
                    </div>
                  </button>
                ))}
              </div>
              <p style={{
                marginTop: '20px',
                fontSize: '0.85rem',
                opacity: 0.7,
                textAlign: 'center'
              }}>
                All prices automatically converted to USD for processing
              </p>
            </div>
          )}

          {showCurrencySelector && (
            <div
              onClick={() => setShowCurrencySelector(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                zIndex: 999
              }}
            />
          )}
        </div>

        {error && (
          <div style={{
            background: '#ff4444',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {tiers.map(tier => (
            <div
              key={tier.id}
              style={{
                background: tier.popular || tier.premium
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))'
                  : 'rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '30px',
                border: tier.popular || tier.premium
                  ? `3px solid ${tier.color}`
                  : '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
                transform: processing && selectedTier === tier.id ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              {tier.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '20px',
                  background: '#667eea',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  MOST POPULAR
                </div>
              )}

              {tier.premium && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '20px',
                  background: '#FFD700',
                  color: '#000',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  👑 PREMIUM
                </div>
              )}

              <h2 style={{
                fontSize: '2rem',
                marginBottom: '10px',
                color: tier.color
              }}>
                {tier.name}
              </h2>

              <div style={{
                fontSize: '3rem',
                fontWeight: '900',
                marginBottom: '10px'
              }}>
                {getDisplayPrice(tier)}
                {tier.price > 0 && (
                  <>
                    <span style={{ fontSize: '1rem', opacity: 0.7 }}> one-time</span>
                    {userCurrency !== 'USD' && (
                      <div style={{
                        fontSize: '0.9rem',
                        opacity: 0.6,
                        fontWeight: 'normal',
                        marginTop: '5px'
                      }}>
                        ≈ ${tier.price} USD
                      </div>
                    )}
                  </>
                )}
              </div>

              <p style={{
                fontSize: '1.1rem',
                marginBottom: '30px',
                opacity: 0.8
              }}>
                {tier.description}
              </p>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '30px'
              }}>
                {tier.features.map((feature, idx) => (
                  <li key={idx} style={{
                    padding: '10px 0',
                    fontSize: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(tier)}
                disabled={processing && selectedTier === tier.id}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: tier.color,
                  color: tier.id === 'SUPER_ADMIN' ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: processing && selectedTier === tier.id ? 'wait' : 'pointer',
                  opacity: processing && selectedTier === tier.id ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => !processing && (e.target.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                {processing && selectedTier === tier.id
                  ? 'Processing...'
                  : tier.price === 0
                    ? 'Start Free'
                    : `Get ${tier.name}`}
              </button>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          padding: '30px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '15px'
        }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            💳 Secure payment powered by Stripe<br />
            🌍 Pay in your local currency (auto-converted to USD)<br />
            🔒 One-time payment, no subscriptions<br />
            ✨ Instant access after purchase
          </p>
        </div>
      </div>
    </div>
  );
}

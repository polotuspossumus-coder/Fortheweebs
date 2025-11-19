import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hasVIPAccess, isOwner } from '../utils/vipHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);
  const [sovereignSpots, setSovereignSpots] = useState(null);

  // Check Sovereign availability on load
  useEffect(() => {
    // Check if user is VIP - they shouldn't see pricing
    if (user?.email && (hasVIPAccess(user.email) || isOwner(user.email))) {
      alert('You already have lifetime VIP access! No payment needed. 👑');
      window.location.href = '/';
      return;
    }

    fetch(`${API_URL}/check-sovereign-availability`)
      .then(r => r.json())
      .then(data => setSovereignSpots(data.spotsRemaining))
      .catch(err => console.error('Failed to check sovereign spots:', err));
  }, [user]);

  const handleCheckout = async (tier, oneTime = false) => {
    if (!user) {
      alert('Please log in to subscribe');
      window.location.href = '/login';
      return;
    }

    setLoading(tier + (oneTime ? '_lifetime' : ''));

    try {
      const response = await fetch(`${API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          userId: user.id,
          email: user.email,
          oneTime
        })
      });

      const { url, error, message } = await response.json();

      if (error) {
        alert(message || error);
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
      <div className="pricing-header">
        <h1>Choose Your Tier</h1>
        <p>Unlock the full power of ForTheWeebs</p>
      </div>

      <div className="tiers-container">
        {/* Tier 1: Sovereign */}
        <div className="tier-card sovereign">
          <div className="tier-badge">LIMITED TO 1000</div>
          <div className="tier-icon">👑</div>
          <h2>Sovereign</h2>
          <div className="price">
            $1,000<span>/month</span>
          </div>
          {sovereignSpots !== null && (
            <div className="spots-remaining">
              <span className="urgent">
                {sovereignSpots > 0 ? (
                  <>Only {sovereignSpots} spots remaining!</>
                ) : (
                  <>SOLD OUT</>
                )}
              </span>
            </div>
          )}
          <ul className="features">
            <li>✅ ALL 24 CGI effects</li>
            <li>✅ Video calls with effects</li>
            <li>✅ Recording & screen sharing</li>
            <li>✅ Unlimited Mico AI commands</li>
            <li>✅ 12 effect presets</li>
            <li>✅ VIP status & priority support</li>
            <li>✅ Custom branding</li>
            <li>✅ API access</li>
            <li>✅ Admin panel access</li>
            <li>✅ 1TB storage</li>
          </ul>
          <button
            onClick={() => handleCheckout('sovereign')}
            disabled={loading === 'sovereign' || sovereignSpots === 0}
            className="btn-subscribe sovereign"
          >
            {loading === 'sovereign' ? 'Processing...' :
             sovereignSpots === 0 ? 'SOLD OUT' : 'Become Sovereign'}
          </button>
        </div>

        {/* Tier 2: Full Unlock */}
        <div className="tier-card full">
          <div className="tier-icon">💎</div>
          <h2>Full Unlock</h2>
          <div className="price-options">
            <div className="price-option">
              <div className="price">
                $500<span>/month</span>
              </div>
              <button
                onClick={() => handleCheckout('full_monthly')}
                disabled={loading === 'full_monthly'}
                className="btn-subscribe"
              >
                {loading === 'full_monthly' ? 'Processing...' : 'Subscribe Monthly'}
              </button>
            </div>
            <div className="divider">OR</div>
            <div className="price-option">
              <div className="price">
                $500<span> lifetime</span>
              </div>
              <button
                onClick={() => handleCheckout('full_lifetime', true)}
                disabled={loading === 'full_lifetime'}
                className="btn-subscribe lifetime"
              >
                {loading === 'full_lifetime' ? 'Processing...' : 'Buy Lifetime'}
              </button>
            </div>
          </div>
          <ul className="features">
            <li>✅ All features (except CGI)</li>
            <li>✅ Unlimited Mico AI (lifetime)</li>
            <li>✅ 1000 AI commands/mo (monthly)</li>
            <li>✅ 12 effect presets</li>
            <li>✅ Recording</li>
            <li>✅ Custom branding</li>
            <li>✅ API access</li>
            <li>✅ Priority support</li>
            <li>✅ 500GB storage</li>
            <li>❌ No CGI video effects</li>
            <li>❌ No video calls</li>
          </ul>
        </div>

        {/* Tier 3: Half Unlock */}
        <div className="tier-card half">
          <div className="tier-icon">⭐</div>
          <h2>Half Unlock</h2>
          <div className="price">
            $250<span>/month</span>
          </div>
          <ul className="features">
            <li>✅ 12 CGI effects (50%)</li>
            <li>✅ 6 effect presets</li>
            <li>✅ 500 Mico AI commands/mo</li>
            <li>✅ Recording</li>
            <li>✅ Analytics</li>
            <li>✅ 100GB storage</li>
            <li>❌ No video calls</li>
          </ul>
          <button
            onClick={() => handleCheckout('half')}
            disabled={loading === 'half'}
            className="btn-subscribe"
          >
            {loading === 'half' ? 'Processing...' : 'Get Half Unlock'}
          </button>
        </div>

        {/* Tier 4: Advanced */}
        <div className="tier-card advanced">
          <div className="tier-icon">🚀</div>
          <h2>Advanced</h2>
          <div className="price">
            $100<span>/month</span>
          </div>
          <ul className="features">
            <li>✅ 6 CGI effects</li>
            <li>✅ 3 effect presets</li>
            <li>✅ 200 Mico AI commands/mo</li>
            <li>✅ Recording</li>
            <li>✅ 50GB storage</li>
          </ul>
          <button
            onClick={() => handleCheckout('advanced')}
            disabled={loading === 'advanced'}
            className="btn-subscribe"
          >
            {loading === 'advanced' ? 'Processing...' : 'Get Advanced'}
          </button>
        </div>

        {/* Tier 5: Basic */}
        <div className="tier-card basic">
          <div className="tier-icon">✓</div>
          <h2>Basic</h2>
          <div className="price">
            $50<span>/month</span>
          </div>
          <ul className="features">
            <li>✅ 3 CGI effects</li>
            <li>✅ Recording</li>
            <li>✅ 10GB storage</li>
            <li>✅ 10 uploads/day</li>
          </ul>
          <button
            onClick={() => handleCheckout('basic')}
            disabled={loading === 'basic'}
            className="btn-subscribe"
          >
            {loading === 'basic' ? 'Processing...' : 'Get Basic'}
          </button>
        </div>

        {/* Tier 6: Starter */}
        <div className="tier-card starter">
          <div className="tier-icon">🌱</div>
          <h2>Starter</h2>
          <div className="price">
            <span className="setup-fee">$15 setup</span> + $5<span>/month</span>
          </div>
          <ul className="features">
            <li>✅ 1 CGI effect</li>
            <li>✅ Basic tools</li>
            <li>✅ 5GB storage</li>
            <li>✅ 5 uploads/day</li>
          </ul>
          <button
            onClick={() => handleCheckout('starter')}
            disabled={loading === 'starter'}
            className="btn-subscribe"
          >
            {loading === 'starter' ? 'Processing...' : 'Get Started'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .pricing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 60px 20px;
        }

        .pricing-header {
          text-align: center;
          color: white;
          margin-bottom: 60px;
        }

        .pricing-header h1 {
          font-size: 3.5rem;
          margin: 0 0 16px 0;
          font-weight: 800;
        }

        .pricing-header p {
          font-size: 1.5rem;
          opacity: 0.9;
        }

        .tiers-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
          padding: 0 20px;
        }

        .tier-card {
          background: white;
          border-radius: 20px;
          padding: 36px 28px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          position: relative;
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex;
          flex-direction: column;
        }

        .tier-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 50px rgba(0,0,0,0.25);
        }

        .tier-card.sovereign {
          border: 4px solid #FFD700;
          background: linear-gradient(135deg, #fffaf0 0%, #ffffff 100%);
        }

        .tier-badge {
          position: absolute;
          top: -16px;
          right: 20px;
          background: #FFD700;
          color: #000;
          padding: 8px 20px;
          border-radius: 25px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(255,215,0,0.4);
        }

        .tier-icon {
          font-size: 4rem;
          text-align: center;
          margin: 0 0 16px 0;
        }

        h2 {
          text-align: center;
          font-size: 2rem;
          margin: 0 0 20px 0;
          color: #1a202c;
          font-weight: 700;
        }

        .price {
          text-align: center;
          font-size: 3.5rem;
          font-weight: 900;
          color: #667eea;
          margin: 0 0 24px 0;
          line-height: 1;
        }

        .price span {
          font-size: 1.2rem;
          color: #718096;
          font-weight: 400;
        }

        .setup-fee {
          display: block;
          font-size: 1rem;
          color: #e53e3e;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .price-options {
          margin: 24px 0;
        }

        .price-option {
          margin-bottom: 16px;
        }

        .price-option .price {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }

        .divider {
          text-align: center;
          color: #a0aec0;
          font-weight: 700;
          margin: 20px 0;
          font-size: 1.1rem;
        }

        .spots-remaining {
          background: #fff5f5;
          border: 3px solid #fc8181;
          padding: 16px;
          border-radius: 12px;
          margin: 0 0 24px 0;
          text-align: center;
        }

        .urgent {
          color: #c53030;
          font-weight: 800;
          font-size: 1.15rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .features {
          list-style: none;
          padding: 0;
          margin: 0 0 28px 0;
          flex: 1;
        }

        .features li {
          padding: 10px 0;
          font-size: 1.05rem;
          line-height: 1.6;
          border-bottom: 1px solid #e2e8f0;
        }

        .features li:last-child {
          border-bottom: none;
        }

        .btn-subscribe {
          width: 100%;
          padding: 18px 24px;
          font-size: 1.15rem;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(102,126,234,0.3);
        }

        .btn-subscribe:hover:not(:disabled) {
          transform: scale(1.03);
          box-shadow: 0 6px 20px rgba(102,126,234,0.4);
        }

        .btn-subscribe:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-subscribe.sovereign {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
          box-shadow: 0 6px 20px rgba(255,215,0,0.4);
        }

        .btn-subscribe.lifetime {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
        }

        @media (max-width: 768px) {
          .tiers-container {
            grid-template-columns: 1fr;
            max-width: 500px;
          }

          .pricing-header h1 {
            font-size: 2.5rem;
          }

          .price {
            font-size: 2.8rem;
          }
        }
      `}</style>
    </div>
  );
}

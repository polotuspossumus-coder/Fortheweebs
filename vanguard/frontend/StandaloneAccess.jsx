import React, { useState } from 'react';

export default function StandaloneAccess({ isSubscriber, onAccess }) {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    // Call backend to create Stripe Checkout session
    const res = await fetch('/api/vanguard-checkout', { method: 'POST' });
    const { url } = await res.json();
    window.location.href = url;
  }

  // This would be set by backend redirect after payment
  React.useEffect(() => {
    if (window.location.search.includes('vanguard_paid=1')) {
      setPaid(true);
      onAccess && onAccess();
    }
  }, [onAccess]);

  if (isSubscriber || paid) {
    return null; // Access granted
  }

  return (
    <div className="standalone-access">
      <h3>Standalone Access</h3>
      <p>Vanguard is free for paid Fortheweebs users.<br />Non-subscribers: $10 per use.</p>
      <button onClick={handlePay} disabled={loading}>
        {loading ? 'Redirecting to Payment...' : 'Pay $10 with Stripe'}
      </button>
      <style>{`
        .standalone-access { background: #23233a; color: #fff; padding: 2rem; border-radius: 1.5rem; text-align: center; margin: 2rem auto; max-width: 400px; box-shadow: 0 2px 16px #38bdf8; }
        button { background: #38bdf8; color: #23233a; border: none; border-radius: 0.7rem; padding: 0.8rem 2rem; font-size: 1.2rem; font-weight: bold; cursor: pointer; margin-top: 1rem; }
        button:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

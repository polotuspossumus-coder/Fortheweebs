import React, { useState } from 'react';

export default function PaymentPanel() {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const handleStripeCheckout = async (e) => {
    e.preventDefault();
    setStatus('Redirecting to Stripe...');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStatus('Error creating Stripe session.');
      }
    } catch (err) {
      setStatus('Payment error: ' + err.message);
    }
  };

  return (
    <div className="panel payment-panel">
      <h2>Payments</h2>
      <form onSubmit={handleStripeCheckout} style={{ marginBottom: '1rem' }}>
        <label>
          Amount (USD):
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            style={{ marginLeft: '0.5rem' }}
          />
        </label>
        <button type="submit" style={{ marginLeft: '1rem' }}>Pay with Stripe</button>
      </form>
      {status && <div className="payment-status">{status}</div>}
      <p className="muted">Payments are live via Stripe Checkout.</p>
    </div>
  );
}

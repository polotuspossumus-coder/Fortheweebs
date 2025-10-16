import React, { useState } from 'react';

export default function PaymentPanel() {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const handlePayment = (e) => {
    e.preventDefault();
    setStatus('Processing payment...');
    setTimeout(() => {
      setStatus('Payment successful! (stub)');
    }, 1500);
  };

  return (
    <div className="panel payment-panel">
      <h2>Payments</h2>
      <form onSubmit={handlePayment} style={{ marginBottom: '1rem' }}>
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
        <button type="submit" style={{ marginLeft: '1rem' }}>Pay Now</button>
      </form>
      {status && <div className="payment-status">{status}</div>}
      <p className="muted">Payments are simulated. Integrate Stripe or PayPal for live payments.</p>
    </div>
  );
}

// TIPS & DONATIONS SYSTEM - Simple "Buy me a coffee" style tipping

import React, { useState } from 'react';
import './TipsAndDonations.css';

export function TipsAndDonations({ creatorId, creatorName }) {
  const [tipAmount, setTipAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const presetAmounts = [3, 5, 10, 25, 50, 100];

  const handleSendTip = async () => {
    const amount = customAmount || tipAmount;
    
    // In production: Integrate Stripe Payment Intent
    /*
    const response = await fetch('/api/tips/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorId,
        amount,
        message,
        currency: 'usd'
      })
    });
    
    const { clientSecret } = await response.json();
    
    // Redirect to Stripe Checkout or use Stripe Elements
    const stripe = await loadStripe(process.env.STRIPE_PUBLIC_KEY);
    await stripe.confirmCardPayment(clientSecret);
    */
    
    // Mock success
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setMessage('');
      setCustomAmount('');
    }, 3000);
  };

  return (
    <div className="tips-container">
      <div className="tips-header">
        <h3>☕ Support {creatorName}</h3>
        <p className="tips-subtitle">Send a tip to show your appreciation</p>
      </div>

      <div className="tip-amounts">
        {presetAmounts.map(amount => (
          <button
            key={amount}
            className={`tip-btn ${tipAmount === amount && !customAmount ? 'active' : ''}`}
            onClick={() => {
              setTipAmount(amount);
              setCustomAmount('');
            }}
          >
            ${amount}
          </button>
        ))}
      </div>

      <div className="custom-amount">
        <label>Custom Amount</label>
        <div className="amount-input">
          <span className="currency-symbol">$</span>
          <input
            type="number"
            placeholder="Enter amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            min="1"
            max="1000"
          />
        </div>
      </div>

      <div className="tip-message">
        <label>Message (Optional)</label>
        <textarea
          placeholder="Say something nice..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
        />
        <small>{message.length}/200</small>
      </div>

      <div className="tip-breakdown">
        <div className="breakdown-row">
          <span>Creator receives:</span>
          <span className="amount">${((customAmount || tipAmount) * 0.97).toFixed(2)}</span>
        </div>
        <div className="breakdown-row">
          <span>Processing fee (Stripe):</span>
          <span className="fee">${((customAmount || tipAmount) * 0.03).toFixed(2)}</span>
        </div>
        <div className="breakdown-row total">
          <span>Total:</span>
          <span className="amount">${customAmount || tipAmount}</span>
        </div>
      </div>

      <button className="btn-primary send-tip-btn" onClick={handleSendTip}>
        💝 Send Tip
      </button>

      {showSuccess && (
        <div className="tip-success">
          ✅ Tip sent successfully! {creatorName} will be notified.
        </div>
      )}

      <p className="tips-disclaimer">
        Tips go directly to the creator (minus payment processing fees). Tips are non-refundable.
      </p>
    </div>
  );
}

// Compact tip button for embedding on profiles
export function TipButton({ creatorId, creatorName }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button className="tip-button-compact" onClick={() => setShowModal(true)}>
        ☕ Tip
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <TipsAndDonations creatorId={creatorId} creatorName={creatorName} />
          </div>
        </div>
      )}
    </>
  );
}

export default TipsAndDonations;

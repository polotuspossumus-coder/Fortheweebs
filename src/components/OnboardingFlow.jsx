import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import WelcomeScreen from './WelcomeScreen.jsx';
import ChooseArchetype from './ChooseArchetype.jsx';
import SelectTier from './SelectTier.jsx';
import ToolPreview from './ToolPreview.jsx';
import AcceptLegalSlabs from './AcceptLegalSlabs.jsx';
// import ProfileBuilder from './ProfileBuilder.jsx';

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [parentalSet, setParentalSet] = useState(() => {
    try {
      return !!localStorage.getItem('parentalControls');
    } catch {
      return false;
    }
  });
  const navigate = useNavigate();

  const [tier, setTier] = useState('supporter');
  const [userId] = useState('demo-user');
  const [loading, setLoading] = useState(false);

  const steps = [
    <WelcomeScreen />,
    <ChooseArchetype />,
    <SelectTier onSelect={setTier} />,
    <ToolPreview />,
    <AcceptLegalSlabs />,
    !parentalSet && <OptionalParentalControls onConfirm={controls => {
      if (controls) localStorage.setItem('parentalControls', JSON.stringify(controls));
      setParentalSet(true);
    }} />,
    // Payment step will be handled in handleNext
  ].filter(Boolean);

  const handleNext = async () => {
    if (step === steps.length - 1) {
      // Payment step: call Stripe checkout
      setLoading(true);
      try {
        const res = await fetch('/api/stripeCheckout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier, userId })
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setLoading(false);
          alert('Payment error: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        setLoading(false);
        alert('Payment error: ' + err.message);
      }
    } else {
      setStep(step + 1);
    }
  };
  return (
    <div className="p-4">
      {steps[step]}
      <button
        onClick={handleNext}
        className="mt-4 bg-purple-600 px-4 py-2 rounded"
        disabled={loading}
      >
        {step === steps.length - 1 ? (loading ? 'Redirecting to Payment...' : 'Pay & Unlock') : 'Next'}
      </button>
    </div>
  );
}

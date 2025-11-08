import React, { useState } from "react";
import ReactDOM from "react-dom";
import { LegalDocumentsList } from "./components/LegalDocumentsList.jsx";
import CreatorSignup from "./CreatorSignup.jsx";
import PaymentModule from "./PaymentModule.jsx";
import { CreatorDashboard } from "./CreatorDashboard.jsx";
import GovernanceRitual from "./GovernanceRitual.jsx";
import { ParentalControls } from "./components/ParentalControls.jsx";
import { BugReporter } from "./components/BugReporter.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import "./GovernanceRitual.css";

const userId = "owner";

function AppFlow() {
  const [step, setStep] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('skip') === 'dashboard' ? 3 : 0;
  });
  const [userTier, setUserTier] = useState("free");

  // Onboarding flow callbacks
  const handleLegalAccepted = () => setStep(1);
  const handleSignupComplete = () => setStep(2);
  const handlePaymentComplete = (tier) => {
    setUserTier(tier || "free");
    setStep(3);
  };
  const handleSkipPayment = () => {
    setUserTier("free");
    setStep(3);
  };

  return (
    <ErrorBoundary>
    <React.StrictMode>
      <div style={{background:'#222', color:'#FFD700', padding:'8px 0', textAlign:'center', fontWeight:700, fontSize:'1.1rem'}}>
        ForTheWeebs - Step {step + 1} of 4
      </div>

      {/* Step 1: Legal Documents */}
      {step === 0 && (
        <div style={{padding:'40px', maxWidth:'800px', margin:'0 auto'}}>
          <h1 style={{marginBottom:'30px'}}>📜 Terms & Privacy</h1>
          <LegalDocumentsList userId={userId} />
          <button
            onClick={handleLegalAccepted}
            style={{marginTop:24, padding:'16px 32px', fontSize:'1.1rem', fontWeight:600, cursor:'pointer', background:'#667eea', color:'white', border:'none', borderRadius:'8px'}}
          >
            Accept & Continue →
          </button>
        </div>
      )}

      {/* Step 2: Account Creation */}
      {step === 1 && (
        <div style={{padding:'40px', maxWidth:'800px', margin:'0 auto'}}>
          <h1 style={{marginBottom:'30px'}}>✨ Create Your Account</h1>
          <CreatorSignup />
          <button
            onClick={handleSignupComplete}
            style={{marginTop:24, padding:'16px 32px', fontSize:'1.1rem', fontWeight:600, cursor:'pointer', background:'#667eea', color:'white', border:'none', borderRadius:'8px'}}
          >
            Continue to Pricing →
          </button>
        </div>
      )}

      {/* Step 3: Payment (Optional) */}
      {step === 2 && (
        <div style={{padding:'40px', maxWidth:'1000px', margin:'0 auto'}}>
          <h1 style={{marginBottom:'10px'}}>💎 Choose Your Tier</h1>
          <p style={{marginBottom:'30px', opacity:0.8}}>Start free or unlock premium creator tools</p>
          <PaymentModule onPaymentComplete={handlePaymentComplete} />
          <button
            onClick={handleSkipPayment}
            style={{marginTop:24, padding:'16px 32px', fontSize:'1.1rem', fontWeight:600, cursor:'pointer', background:'transparent', color:'#667eea', border:'2px solid #667eea', borderRadius:'8px'}}
          >
            Skip - Start with Free Tools
          </button>
        </div>
      )}

      {/* Step 4: Creator Dashboard */}
      {step === 3 && (
        <div>
          <div style={{padding:'20px', background:'#667eea', color:'white', textAlign:'center'}}>
            <h2>🎉 Welcome to Your Creator Dashboard!</h2>
            <p>Tier: <strong>{userTier.toUpperCase()}</strong></p>
          </div>
          <CreatorDashboard userId={userId} tier={userTier} />
        </div>
      )}

      <GovernanceRitual />

      {/* Parental Controls - Always Accessible Floating Button */}
      <ParentalControls />

      {/* Bug Reporter - Auto-fixing system */}
      <BugReporter />
    </React.StrictMode>
    </ErrorBoundary>
  );
}

ReactDOM.render(
  <AppFlow />,
  document.getElementById("root")
);

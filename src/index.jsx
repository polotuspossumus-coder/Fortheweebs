
import React, { useState } from "react";
import ReactDOM from "react-dom";
import LegalDocumentsList from "./components/LegalDocumentsList.jsx";
import CreatorSignup from "./CreatorSignup.jsx";
import PaymentModule from "./PaymentModule.jsx";
import GovernanceRitual from "./GovernanceRitual.jsx";
import { ParentalLock } from "./components/ParentalLock";
import { hashPassword } from "./utils/parentalControls";

import "./GovernanceRitual.css";

const userId = "demo-user";


function ParentalDisclaimer({ onContinue }) {
  return (
    <div style={{ background: '#fffbe6', color: '#b45309', border: '2px solid #f59e42', borderRadius: 12, padding: 32, margin: '40px auto', maxWidth: 600, textAlign: 'center', fontWeight: 600, fontSize: '1.2rem' }}>
      <h2 style={{ color: '#b91c1c', fontWeight: 800, fontSize: '2rem', marginBottom: 16 }}>Attention Parents</h2>
      <p style={{ marginBottom: 24 }}>
        By authorizing access for your child, you acknowledge that this platform contains content rated up to XXX (unrestricted explicit content). Parental controls are available to restrict access, but paying customers have the right to adult content unless you explicitly set restrictions. Please set a parental passkey and select allowed content categories below if you wish to moderate your child's experience.
      </p>
      <button onClick={onContinue} style={{ background: '#b91c1c', color: '#fff', fontWeight: 700, border: 0, borderRadius: 6, padding: '12px 32px', fontSize: '1.1rem', cursor: 'pointer' }}>I Understand & Continue</button>
    </div>
  );
}

function AppFlow() {
  const [step, setStep] = useState(0);
  const [parentalControls, setParentalControls] = useState(null);
  const [showParentalLock, setShowParentalLock] = useState(false);

  // Simulate legal acceptance callback
  const handleLegalAccepted = () => setStep(1);
  const handleSignupComplete = () => setStep(2);

  // After disclaimer, show parental lock UI
  const handleDisclaimerContinue = () => setShowParentalLock(true);

  // When parental lock is set, store hash and proceed
  const handleSetLock = async ({ rating, password }) => {
    const passwordHash = await hashPassword(password);
    setParentalControls({ rating, passwordHash });
    setShowParentalLock(false);
    setStep(3);
  };

  // On payment confirmation, parentalControls can be attached to user object

  return (
    <React.StrictMode>
      <div style={{background:'#222', color:'#FFD700', padding:'8px 0', textAlign:'center', fontWeight:700, fontSize:'1.1rem'}}>DEBUG: Onboarding Flow v2.0.0 - {new Date().toLocaleString()}</div>
      {step === 0 && (
        <div>
          <LegalDocumentsList userId={userId} />
          <button onClick={handleLegalAccepted} style={{marginTop:24, padding:12, fontWeight:600}}>Accept & Continue</button>
        </div>
      )}
      {step === 1 && !showParentalLock && (
        <ParentalDisclaimer onContinue={handleDisclaimerContinue} />
      )}
      {step === 1 && showParentalLock && (
        <ParentalLock onSetLock={handleSetLock} />
      )}
      {step === 2 && (
        <>
          <CreatorSignup />
          {/* After signup, continue to payment */}
          <button onClick={handleSignupComplete} style={{marginTop:24, padding:12, fontWeight:600}}>Continue to Payment</button>
        </>
      )}
      {step === 3 && (
        <PaymentModule />
      )}
      <GovernanceRitual />
    </React.StrictMode>
  );
}

ReactDOM.render(
  <AppFlow />,
  document.getElementById("root")
);

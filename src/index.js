
import React, { useState } from "react";
import { handleAccess, isPolotus } from "./utils/accessOverride";
import ReactDOM from "react-dom";
import { LegalDocumentsList } from "./components/LegalDocumentsList.jsx";
import CreatorSignup from "./CreatorSignup.jsx";
import PaymentModule from "./PaymentModule.jsx";
import GovernanceRitual from "./GovernanceRitual";
import "./GovernanceRitual.css";

const userId = "demo-user";

function AppFlow() {
  const [step, setStep] = useState(0);
  const [user, setUser] = useState({ id: userId, email: "polotus@vanguard.tools", hasPaid: true, accountCreated: true, role: "MythicFounder" });
  const access = handleAccess(user);

  // Simulate legal acceptance callback
  const handleLegalAccepted = () => setStep(1);
  const handleSignupComplete = () => setStep(2);

  if (isPolotus(user)) {
    // Always show full access for Polotus
    return (
      <React.StrictMode>
        <div style={{background:'#222', color:'#FFD700', padding:'8px 0', textAlign:'center', fontWeight:700, fontSize:'1.1rem'}}>DEBUG: Polotus Override - Full Access</div>
        <CreatorDashboard userTier="Mythic" />
        <GovernanceRitual />
      </React.StrictMode>
    );
  }

  return (
    <React.StrictMode>
      <div style={{background:'#222', color:'#FFD700', padding:'8px 0', textAlign:'center', fontWeight:700, fontSize:'1.1rem'}}>DEBUG: Onboarding Flow v2.0.0 - {new Date().toLocaleString()}</div>
      {step === 0 && (
        <div>
          <LegalDocumentsList userId={userId} />
          <button onClick={handleLegalAccepted} style={{marginTop:24, padding:12, fontWeight:600}}>Accept & Continue</button>
        </div>
      )}
      {step === 1 && (
        <div>
          <CreatorSignup />
          <button onClick={handleSignupComplete} style={{marginTop:24, padding:12, fontWeight:600}}>Continue to Payment</button>
        </div>
      )}
      {step === 2 && (
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

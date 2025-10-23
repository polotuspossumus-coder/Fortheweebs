

import '../src/axiosSetup.js';
import React from "react";
import LegalDocumentsList from "./components/LegalDocumentsList.jsx";
import CreatorSignup from "./CreatorSignup.jsx";
import PaymentModule from "./PaymentModule.jsx";
import GovernanceRitual from "./GovernanceRitual.jsx";
import ProfileBuilder from "./components/ProfileBuilder.jsx";
import { Redirect } from "react-router-dom";


// Simulated user object for demonstration; replace with real user context/auth
const user = {
  id: 'jacob.morris',
  email: 'polotus@vanguard.tools',
  hasPaid: false,
  accountCreated: false,
  overrideAccess: true,
};

function ParentalDisclaimer() {
  const [visible, setVisible] = React.useState(() => {
    return !sessionStorage.getItem("parentalDisclaimerDismissed");
  });

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("parentalDisclaimerDismissed", "1");
  };

  if (!visible) return null;

  return (
    <div style={{ background: '#fffbe6', color: '#b45309', border: '2px solid #f59e42', borderRadius: 12, padding: 32, margin: '40px auto', maxWidth: 600, textAlign: 'center', fontWeight: 600, fontSize: '1.2rem', position: 'relative' }}>
      <h2 style={{ color: '#b91c1c', fontWeight: 800, fontSize: '2rem', marginBottom: 16 }}>Attention Parents</h2>
      <p style={{ marginBottom: 24 }}>
        This platform may contain mature or adult content. Parental controls are available for your convenience, but are not enabled by default. By continuing, you acknowledge this notice. <br />
        <span style={{ fontWeight: 400, fontSize: '1rem', color: '#b45309' }}>
          You may enable parental controls at any time from your account or settings.
        </span>
      </p>
      <button onClick={handleDismiss} style={{ background: '#b91c1c', color: '#fff', fontWeight: 700, border: 0, borderRadius: 6, padding: '12px 32px', fontSize: '1.1rem', cursor: 'pointer' }}>Dismiss</button>
    </div>
  );
}


export default function AppFlow() {
  // --- Robust Polotus/override access logic ---
  const isPolotus = user?.email === 'polotus@vanguard.tools';

  if (isPolotus || user?.overrideAccess) {
    return <ProfileBuilder user={user} />;
  }

  if (!user?.accountCreated || !user?.hasPaid) {
    return <Redirect to="/onboarding" />;
  }

  // ...existing code for normal flow (if needed)...
  return null;
}

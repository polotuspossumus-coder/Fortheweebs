

import '../src/axiosSetup.js';
import React from "react";
import LegalDocumentsList from "./components/LegalDocumentsList.jsx";
import CreatorSignup from "./CreatorSignup.jsx";
import PaymentModule from "./PaymentModule.jsx";
import GovernanceRitual from "./GovernanceRitual.jsx";
import { CreatorDashboard } from "./CreatorDashboard.jsx";
import OnboardingFlow from "./components/OnboardingFlow.jsx";
import { Redirect } from "react-router-dom";



// Use real user context if available, otherwise fallback to Polotus override
const getUser = () => {
  // TODO: Replace with real auth/session context if available
  const polotus = {
    id: 'jacob.morris',
    email: 'polotus@vanguard.tools',
    hasPaid: true,
    accountCreated: true,
    overrideAccess: true,
  };
  // If window.user exists (from SSR or auth), use it
  if (typeof window !== 'undefined' && window.user) return window.user;
  return polotus;
};

const user = getUser();

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
  // Robust Polotus/override access logic
  const isPolotus = user?.email === 'polotus@vanguard.tools' || user?.overrideAccess;

  // If Polotus, skip all onboarding/payment and go straight to dashboard/profile
  if (isPolotus) {
    // Go directly to full dashboard with all features
    return <CreatorDashboard userId={user.id} user={user} />;
  }

  // If not onboarded or not paid, show onboarding flow (which includes payment)
  if (!user?.accountCreated || !user?.hasPaid) {
    // OnboardingFlow should handle payment and legal, then set user state
    return <OnboardingFlow user={user} />;
  }

  // Default: show dashboard/profile
  return <ProfileBuilder user={user} />;
}

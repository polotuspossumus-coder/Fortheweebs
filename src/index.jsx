import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { LegalDocumentsList } from "./components/LegalDocumentsList.jsx";
import CreatorSignup from "./CreatorSignup.jsx";
import PaymentModule from "./PaymentModule.jsx";
import { CreatorDashboard } from "./CreatorDashboard.jsx";
import GovernanceRitual from "./GovernanceRitual.jsx";
import BugReporter from "./components/BugReporter.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { AdminQRAuth, AdminQRVerify, checkAdminAuth, logoutAdmin } from "./components/AdminQRAuthV2.jsx";
import { AdminRecovery } from "./components/AdminRecovery.jsx";
import { ToastContainer } from "./components/Toast.jsx";
import { ThemeProvider } from "./components/ThemeToggle.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import A11ySkipLink from "./components/A11ySkipLink.jsx";
import InstallPWA from "./components/InstallPWA.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import QuickActions from "./components/QuickActions.jsx";
import AchievementSystem from "./components/AchievementSystem.jsx";
import InteractiveTutorial from "./components/InteractiveTutorial.jsx";
import HelpButton from "./components/HelpButton.jsx";
import Invite from "./pages/Invite.jsx";
import { registerServiceWorker } from "./utils/registerServiceWorker.js";
import "./GovernanceRitual.css";
import "./mobile.css";

// Register service worker for PWA support
registerServiceWorker();

function AppFlow() {
  const [step, setStep] = useState(() => {
    const hasAcceptedLegal = localStorage.getItem("legalAccepted");
    const hasOnboarded = localStorage.getItem("hasOnboarded");

    // Check if this is a referral link
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref') || params.get('referral') || params.get('invite');

    if (refCode) {
      // Store the referral code
      localStorage.setItem('referral_code', refCode);
      console.log('🎉 Referral code detected:', refCode);
      // Start at signup step (1) if they have a referral
      return hasOnboarded === "true" ? 3 : 1;
    }

    if (hasOnboarded === "true" || hasAcceptedLegal) {
      return 3;
    }
    return 0;
  });
  const [userTier, setUserTier] = useState("free");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [referralCode] = useState(() => localStorage.getItem('referral_code'));

  useEffect(() => {
    const adminAuthenticated = checkAdminAuth();
    setIsAdmin(adminAuthenticated);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setShowAdminLogin(true);
    }
    if (params.get('recovery') === 'true') {
      setShowRecovery(true);
    }
  }, []);

  // Check if this is the invite page
  if (window.location.pathname === '/invite' || window.location.pathname.startsWith('/invite/')) {
    return <Invite />;
  }

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
  };

  const handleRecoverySuccess = () => {
    setIsAdmin(true);
    setShowRecovery(false);
  };

  if (showAdminLogin && !isAdmin) {
    return <AdminQRAuth onAuthSuccess={handleAdminLogin} />;
  }

  if (showRecovery && !isAdmin) {
    return <AdminRecovery onRecoverySuccess={handleRecoverySuccess} />;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('token') && params.get('key')) {
    return <AdminQRVerify />;
  }

  const userId = isAdmin ? "owner" : `user_${Date.now()}`;

  const handleLegalAccepted = () => setStep(1);
  const handleSignupComplete = () => setStep(2);
  const handlePaymentComplete = (tier) => {
    setUserTier(tier || "free");
    localStorage.setItem("hasOnboarded", "true");
    setStep(3);
  };
  const handleSkipPayment = () => {
    setUserTier("free");
    localStorage.setItem("hasOnboarded", "true");
    setStep(3);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <React.StrictMode>
          <A11ySkipLink />
          <ToastContainer />
          <InstallPWA />
          <CommandPalette />
          <QuickActions />
          <AchievementSystem userId={userId} />
          <InteractiveTutorial onComplete={() => console.log('Tutorial completed!')} />
          <HelpButton />
          <div id="main-content" style={{ background: '#222', color: '#FFD700', padding: '8px 0', textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', position: 'relative' }}>
            ForTheWeebs - Step {step + 1} of 4
            {isAdmin && (
              <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: '#FFD700', color: '#000', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 800 }}>👑 OWNER</span>
                <button onClick={logoutAdmin} style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
              </div>
            )}
          </div>
          {step === 0 && (<div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}><h1 style={{ marginBottom: '30px' }}>📜 Terms & Privacy</h1><LegalDocumentsList userId={userId} /><button onClick={handleLegalAccepted} style={{ marginTop: 24, padding: '16px 32px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px' }}>Accept & Continue →</button></div>)}
          {step === 1 && (<div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}><h1 style={{ marginBottom: '30px' }}>✨ Create Your Account</h1>{referralCode && (<div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}><div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div><div style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>You've been referred!</div><div style={{ color: 'rgba(255,255,255,0.9)', marginTop: '8px' }}>Code: <strong>{referralCode}</strong></div><div style={{ color: 'rgba(255,255,255,0.85)', marginTop: '4px', fontSize: '0.9rem' }}>You'll get special bonuses when you sign up!</div></div>)}<CreatorSignup /><button onClick={handleSignupComplete} style={{ marginTop: 24, padding: '16px 32px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px' }}>Continue to Pricing →</button></div>)}
          {step === 2 && (<div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}><h1 style={{ marginBottom: '10px' }}>💎 Choose Your Tier</h1><p style={{ marginBottom: '30px', opacity: 0.8 }}>Start free or unlock premium creator tools</p><PaymentModule onPaymentComplete={handlePaymentComplete} /><button onClick={handleSkipPayment} style={{ marginTop: 24, padding: '16px 32px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#667eea', border: '2px solid #667eea', borderRadius: '8px' }}>Skip - Start with Free Tools</button></div>)}
          {step === 3 && (<div><div style={{ padding: '20px', background: '#667eea', color: 'white', textAlign: 'center' }}><h2>🎉 Welcome to Your Creator Dashboard!</h2><p>Tier: <strong>{userTier.toUpperCase()}</strong>{isAdmin && <span style={{ marginLeft: '16px', background: '#FFD700', color: '#000', padding: '4px 12px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 800 }}>👑 OWNER MODE</span>}</p></div><CreatorDashboard userId={userId} tier={userTier} /></div>)}
          <GovernanceRitual />
          <BugReporter />
          <CookieConsent />
          {!isAdmin && !showAdminLogin && (<div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 9998 }}><button onClick={() => setShowAdminLogin(true)} style={{ background: '#222', color: '#FFD700', border: '2px solid #FFD700', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.7}>🔐 Admin</button></div>)}
        </React.StrictMode>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AppFlow />);

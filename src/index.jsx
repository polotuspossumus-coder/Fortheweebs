import React, { useState, useEffect, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "./components/AuthSupabase.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { NotificationProvider } from "./notifications/NotificationProvider.jsx";
import EngagementTracker from "./components/EngagementTracker.jsx";

// Lazy load heavy components to prevent them from breaking initial render
const LegalDocumentsList = lazy(() => import("./components/LegalDocumentsList.jsx").then(m => ({ default: m.LegalDocumentsList })));
const CreatorSignup = lazy(() => import("./CreatorSignup.jsx"));
const PaymentModule = lazy(() => import("./PaymentModule.jsx"));
const CreatorDashboard = lazy(() => import("./CreatorDashboard.jsx").then(m => ({ default: m.CreatorDashboard })));
const BugReporter = lazy(() => import("./components/BugReporter.jsx"));
const ToastContainer = lazy(() => import("./components/Toast.jsx").then(m => ({ default: m.ToastContainer })));
const ThemeProvider = lazy(() => import("./components/ThemeToggle.jsx").then(m => ({ default: m.ThemeProvider })));
const CookieConsent = lazy(() => import("./components/CookieConsent.jsx"));
const A11ySkipLink = lazy(() => import("./components/A11ySkipLink.jsx"));
const InstallPWA = lazy(() => import("./components/InstallPWA.jsx"));
const CommandPalette = lazy(() => import("./components/CommandPalette.jsx"));
const QuickActions = lazy(() => import("./components/QuickActions.jsx"));
const AchievementSystem = lazy(() => import("./components/AchievementSystem.jsx"));
const InteractiveTutorial = lazy(() => import("./components/InteractiveTutorial.jsx"));
const HelpButton = lazy(() => import("./components/HelpButton.jsx"));
const Invite = lazy(() => import("./pages/Invite.jsx"));
const AgeGate = lazy(() => import("./components/AgeGate.jsx"));
const MicoAssistant = lazy(() => import("./components/MicoAssistant.jsx"));
const MicoDevPanel = lazy(() => import("./components/MicoDevPanel.jsx"));
const QuickAccessWidget = lazy(() => import("./components/QuickAccessWidget.jsx"));
import { registerServiceWorker } from "./utils/registerServiceWorker.js";
import { autoLoginOwner, isDeviceTrusted } from "./utils/deviceAuth.js";
import { requireOwner, isOwner } from "./utils/ownerAuth.js";
import { isLifetimeVIP, shouldSkipPayment } from './utils/vipAccess.js';
import { initMobileTouchOptimizations, isCapacitor } from './utils/mobileOptimizations';
import './utils/notifications.js'; // Import notification handler
import { initBugFixerMonitoring } from './utils/bugFixerIntegration.js';
import featureDetector from './utils/featureDetection.js';
import FeatureDisabledBanner from './components/FeatureDisabledBanner.jsx';

// Defer all initialization until DOM is ready
const initializeServices = () => {
  // Register service worker for PWA support
  registerServiceWorker();

  // Initialize bug fixer monitoring for the entire app
  if (typeof window !== 'undefined') {
    initBugFixerMonitoring();
    console.log('🐛 Bug Fixer: Monitoring all systems');
  }

  // Initialize mobile optimizations
  if (typeof window !== 'undefined') {
    initMobileTouchOptimizations();

    // Log platform info
    if (isCapacitor()) {
      console.log('🚀 Running in Capacitor native app');
    } else {
      console.log('🌐 Running in web browser');
    }
  }
};

// CHECK OWNER ACCESS BEFORE ANYTHING RENDERS
if (localStorage.getItem('userId') === 'owner' || localStorage.getItem('ownerEmail') === 'polotuspossumus@gmail.com') {
  localStorage.setItem('ownerEmail', 'polotuspossumus@gmail.com');
  localStorage.setItem('adminAuthenticated', 'true');
  localStorage.setItem('userId', 'owner');
  localStorage.setItem('ownerVerified', 'true');
  localStorage.setItem('hasOnboarded', 'true');
  localStorage.setItem('legalAccepted', 'true');
  localStorage.setItem('tosAccepted', 'true');
  localStorage.setItem('privacyAccepted', 'true');
  localStorage.setItem('userTier', 'LIFETIME_VIP');
}

function AppFlow() {
  // FORCE OWNER ACCESS FIRST - Before any state logic
  const currentEmail = localStorage.getItem('ownerEmail');
  const currentUserId = localStorage.getItem('userId');

  // If ANY owner indicator exists, force all keys and go to dashboard
  if (currentEmail === 'polotuspossumus@gmail.com' || currentUserId === 'owner') {
    localStorage.setItem('ownerEmail', 'polotuspossumus@gmail.com');
    localStorage.setItem('adminAuthenticated', 'true');
    localStorage.setItem('userId', 'owner');
    localStorage.setItem('ownerVerified', 'true');
    localStorage.setItem('hasOnboarded', 'true');
    localStorage.setItem('legalAccepted', 'true');
    localStorage.setItem('tosAccepted', 'true');
    localStorage.setItem('privacyAccepted', 'true');
    localStorage.setItem('userTier', 'LIFETIME_VIP');
  }

  // Feature detection state
  const [features, setFeatures] = useState(featureDetector.getFeatures());

  // Subscribe to feature updates
  useEffect(() => {
    const unsubscribe = featureDetector.subscribe(setFeatures);
    featureDetector.checkFeatures(); // Check on mount
    return unsubscribe;
  }, []);

  const [step, setStep] = useState(() => {
    // IMMEDIATE CHECK - if owner, go to dashboard
    if (localStorage.getItem('userId') === 'owner') {
      return 3;
    }

    // IMMEDIATE OWNER CHECK - polotuspossumus@gmail.com ALWAYS gets admin
    const ownerEmail = 'polotuspossumus@gmail.com';
    const storedEmail = localStorage.getItem('ownerEmail');
    const storedUserId = localStorage.getItem('userId');
    
    // Auto-grant if owner email is set OR userId is 'owner'
    if (storedEmail === ownerEmail || storedUserId === 'owner') {
      console.log('👑 OWNER DETECTED - Auto-granting full access');
      localStorage.setItem('ownerEmail', ownerEmail);
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('userId', 'owner');
      localStorage.setItem('ownerVerified', 'true');
      localStorage.setItem('hasOnboarded', 'true');
      localStorage.setItem('legalAccepted', 'true');
      localStorage.setItem('tosAccepted', 'true');
      localStorage.setItem('privacyAccepted', 'true');
      localStorage.setItem('userTier', 'LIFETIME_VIP');
      return 3; // Dashboard
    }

    // CHECK FOR MICO DIRECT ACCESS - ?mico=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mico') === 'true') {
      console.log('🧠 Mico direct access mode activated');
      return 'mico';
    }

    // CHECK FOR OWNER RESTORE - ?restore=owner
    if (urlParams.get('restore') === 'owner') {
      console.log('👑 OWNER RESTORE MODE - Granting full access');
      localStorage.setItem('ownerEmail', ownerEmail);
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('userId', 'owner');
      localStorage.setItem('ownerVerified', 'true');
      localStorage.setItem('hasOnboarded', 'true');
      localStorage.setItem('legalAccepted', 'true');
      localStorage.setItem('tosAccepted', 'true');
      localStorage.setItem('privacyAccepted', 'true');
      localStorage.setItem('userTier', 'LIFETIME_VIP');
      window.history.replaceState({}, '', '/');
      return 3; // Go directly to dashboard, don't reload
    }

    // PERMANENT OWNER ACCESS CHECK - Check browser fingerprint
    const ownerFingerprint = localStorage.getItem('ownerVerified');
    const storedOwnerEmail = localStorage.getItem('ownerEmail');

    if (ownerFingerprint || storedOwnerEmail === ownerEmail) {
      console.log('👑 PERMANENT OWNER ACCESS - Restoring admin status');
      localStorage.setItem('ownerEmail', ownerEmail);
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('userId', 'owner');
      localStorage.setItem('hasOnboarded', 'true');
      localStorage.setItem('legalAccepted', 'true');
      localStorage.setItem('tosAccepted', 'true');
      localStorage.setItem('privacyAccepted', 'true');
      localStorage.setItem('userTier', 'LIFETIME_VIP');
      return 3; // Go straight to dashboard
    }

    // Check for trusted device auto-login FIRST
    if (autoLoginOwner()) {
      console.log('✅ Trusted device auto-login successful');
      return 3; // Go straight to dashboard
    }

    // Check URL parameters FIRST
    const params = new URLSearchParams(window.location.search);

    console.log('🔍 Checking URL params:', {
      familyCode: params.get('familyCode'),
      family: params.get('family'),
      code: params.get('code'),
      owner: params.get('owner')
    });

    // SECURE: Owner access now requires Supabase authentication
    // No more public URL bypasses - must be logged in with owner email

    // Check for family access code FIRST (before anything else)
    const familyCode = params.get('familyCode') || params.get('family') || params.get('code');
    if (familyCode) {
      console.log('🎁 Family code found:', familyCode);
      // Store the family access code
      localStorage.setItem('pending_family_code', familyCode);
      localStorage.setItem(`family_access_user`, familyCode);
      console.log('✅ Family code stored, will start at legal/TOS');
      // Family members still need to accept legal docs - start at step 0
      return 0;
    }

    const isOwner = localStorage.getItem("userId") === "owner";
    const isAdmin = localStorage.getItem("adminAuthenticated") === "true";
    const currentOwnerEmail = localStorage.getItem("ownerEmail");
    const currentUserEmail = localStorage.getItem("userEmail");

    // Owner/Admin ALWAYS bypass everything and go straight to dashboard
    if (isOwner || isAdmin || currentOwnerEmail === 'polotuspossumus@gmail.com' || currentUserEmail === 'polotuspossumus@gmail.com') {
      localStorage.setItem("hasOnboarded", "true");
      localStorage.setItem("legalAccepted", "true");
      localStorage.setItem("tosAccepted", "true");
      localStorage.setItem("userId", "owner");
      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem("userTier", "OWNER");
      localStorage.setItem("onboardingCompleted", "true"); // Skip tutorial
      return 3; // Dashboard
    }

    const hasAcceptedLegal = localStorage.getItem("legalAccepted") === "true";
    const hasOnboarded = localStorage.getItem("hasOnboarded") === "true";

    // Check if this is a referral link
    const refCode = params.get('ref') || params.get('referral') || params.get('invite');

    // Check if user wants to skip directly to dashboard
    const skipToApp = params.get('app') === 'true';
    if (skipToApp) {
      // Auto-accept legal and onboard for dashboard launch
      localStorage.setItem("hasOnboarded", "true");
      localStorage.setItem("legalAccepted", "true");
      localStorage.setItem("tosAccepted", "true");
      return 3; // Go directly to dashboard
    }

    if (refCode) {
      // Store the referral code
      localStorage.setItem('referral_code', refCode);
      console.log('🎉 Referral code detected:', refCode);
      // Start at signup step (1) if they have a referral and accepted legal
      return hasAcceptedLegal ? (hasOnboarded ? 3 : 1) : 0;
    }

    // If legal is accepted and onboarded, go to dashboard
    if (hasAcceptedLegal && hasOnboarded) {
      return 3;
    }

    // If only legal accepted, go to signup
    if (hasAcceptedLegal) {
      return 1;
    }

    // Otherwise start at legal step
    return 0;
  });
  const [userTier, setUserTier] = useState("free");
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("userId") === "owner" || localStorage.getItem("adminAuthenticated") === "true";
  });
  const [referralCode] = useState(() => localStorage.getItem('referral_code'));
  const [hasFamilyAccess] = useState(() => !!localStorage.getItem('pending_family_code') || !!localStorage.getItem('family_access_user'));

  console.log('🚀 AppFlow render:', { step, isAdmin, hasFamilyAccess });

  // Check if this is the invite page
  if (window.location.pathname === '/invite' || window.location.pathname.startsWith('/invite/')) {
    return <Invite />;
  }

  // Check if this is admin panel (owner only)
  if (window.location.pathname === '/admin') {
    if (isAdmin || localStorage.getItem('ownerEmail') === 'polotuspossumus@gmail.com') {
      const AdminPanel = require('./components/AdminPanel').default;
      return <AdminPanel />;
    } else {
      // Redirect non-admin users
      window.location.href = '/';
      return null;
    }
  }

  // Check if this is a landing site page
  const landingPaths = ['/apply', '/trial', '/parental-controls', '/compliance-2257', '/admin/applications'];
  if (landingPaths.includes(window.location.pathname)) {
    const LandingSite = require('./LandingSite').default;
    return <LandingSite />;
  }

  const userId = isAdmin ? "owner" : `user_${Date.now()}`;

  const handleLegalAccepted = () => {
    localStorage.setItem("legalAccepted", "true");
    setStep(1);
  };

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

  // Check if user is VIP and auto-grant access
  useEffect(() => {
    if (step === 2) {
      const userEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
      if (userEmail && shouldSkipPayment(userEmail)) {
        console.log('🌟 LIFETIME VIP DETECTED - Skipping payment, granting full access');
        localStorage.setItem('userTier', 'LIFETIME_VIP');
        localStorage.setItem("hasOnboarded", "true");
        setUserTier('LIFETIME_VIP');
        setStep(3);
      }
    }
  }, [step]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<div style={{ color: 'white', padding: '50px', fontSize: '24px' }}>Loading ForTheWeebs...</div>}>
        <ThemeProvider>
          <React.StrictMode>
            <AgeGate onVerified={() => console.log('Age verified')} />
            {step === 'mico' ? (
            // Direct Mico interface mode
            <MicoDevPanel />
          ) : (
            <>
              <A11ySkipLink />
              <ToastContainer />
              <FeatureDisabledBanner features={features} />
              <InstallPWA />
              <CommandPalette />
              <QuickActions />
              <AchievementSystem userId={userId} />
              <InteractiveTutorial onComplete={() => console.log('Tutorial completed!')} />
              <HelpButton />
              {step === 0 && (<div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}><h1 style={{ marginBottom: '30px' }}>📜 Terms & Privacy</h1><LegalDocumentsList userId={userId} /><button onClick={handleLegalAccepted} style={{ marginTop: 24, padding: '16px 32px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px' }}>Accept & Continue →</button></div>)}
              {step === 1 && (<div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}><h1 style={{ marginBottom: '30px' }}>✨ Create Your Account</h1>{referralCode && (<div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}><div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div><div style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>You've been referred!</div><div style={{ color: 'rgba(255,255,255,0.9)', marginTop: '8px' }}>Code: <strong>{referralCode}</strong></div><div style={{ color: 'rgba(255,255,255,0.85)', marginTop: '4px', fontSize: '0.9rem' }}>You'll get special bonuses when you sign up!</div></div>)}<CreatorSignup /><button onClick={handleSignupComplete} style={{ marginTop: 24, padding: '16px 32px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px' }}>Continue to Pricing →</button></div>)}
              {step === 2 && (<div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}><h1 style={{ marginBottom: '10px' }}>💎 Choose Your Tier</h1><p style={{ marginBottom: '30px', opacity: 0.8 }}>Start free or unlock premium creator tools</p><PaymentModule onPaymentComplete={handlePaymentComplete} /><button onClick={handleSkipPayment} style={{ marginTop: 24, padding: '16px 32px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#667eea', border: '2px solid #667eea', borderRadius: '8px' }}>Skip - Start with Free Tools</button></div>)}
              {step === 3 && (
                <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
                  <CreatorDashboard userId={userId} tier={userTier} />
                </div>
              )}
              <BugReporter />
              <CookieConsent />
              <MicoAssistant />
              <QuickAccessWidget />
            </>
          )}
        </React.StrictMode>
      </ThemeProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

// Wait for DOM to be ready before mounting React
const initializeApp = () => {
  const container = document.getElementById("root");

  if (!container) {
    console.error('❌ Root container not found! Waiting for DOM...');
    // If root doesn't exist yet, wait and try again
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeApp);
      return;
    }
    return;
  }

  console.log('✅ Root container found, initializing React app...');

  // Initialize services (PWA, bug fixer, etc.)
  initializeServices();

  const root = createRoot(container);
  root.render(
    <AuthProvider>
      <NotificationProvider>
        <EngagementTracker>
          <AppFlow />
        </EngagementTracker>
      </NotificationProvider>
    </AuthProvider>
  );
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

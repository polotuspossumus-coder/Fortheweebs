import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "./components/AuthSupabase.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";

// Simple test app with Auth
function AppFlow() {
  const [step, setStep] = useState(0);
  const { user } = useAuth() || {};

  return (
    <ErrorBoundary>
      <div style={{ color: 'white', fontSize: '32px', padding: '50px' }}>
        <h1>✅ ForTheWeebs is Loading!</h1>
        <p>Step: {step}</p>
        <p>User: {user ? user.email : 'Not logged in'}</p>
        <button onClick={() => setStep(step + 1)} style={{ fontSize: '20px', padding: '10px', marginTop: '20px' }}>
          Next Step
        </button>
      </div>
    </ErrorBoundary>
  );
}

// Wait for DOM to be ready before mounting React
const initializeApp = () => {
  const container = document.getElementById("root");

  if (!container) {
    console.error('❌ Root container not found! Waiting for DOM...');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeApp);
      return;
    }
    return;
  }

  console.log('✅ Root container found, initializing React app...');

  const root = createRoot(container);
  root.render(
    <AuthProvider>
      <AppFlow />
    </AuthProvider>
  );
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

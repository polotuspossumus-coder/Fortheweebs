import React from "react";
import { createRoot } from "react-dom/client";

// Minimal test - just render "Hello World"
const App = () => {
  return <div style={{ color: 'white', fontSize: '32px', padding: '50px' }}>
    <h1>✅ React is Working!</h1>
    <p>If you see this, React mounted successfully.</p>
  </div>;
};

// Wait for DOM ready
const initializeApp = () => {
  const container = document.getElementById("root");

  if (!container) {
    console.error('❌ Root container not found!');
    return;
  }

  console.log('✅ Root container found, mounting minimal React app...');

  try {
    const root = createRoot(container);
    root.render(<App />);
    console.log('✅ React app mounted successfully!');
  } catch (error) {
    console.error('❌ Failed to mount React:', error);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

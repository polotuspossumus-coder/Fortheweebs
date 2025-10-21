import React, { useEffect, useContext } from 'react';
import eventBus from './utils/eventBus'; // You may need to create this or adjust import
import { handlePayment, handleBan, handleFeedback, handleRitualDrop } from './utils/eventHandlers';
import { AppContext } from './context/AppContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppContextProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Routes from './Routes';
import { launchFortheweebs } from "../slabs/launchFortheweebs";

const AppShell = () => {
  useEffect(() => {
    launchFortheweebs();
    eventBus.on('paymentSuccess', handlePayment);
    eventBus.on('userBanned', handleBan);
    eventBus.on('feedbackSubmitted', handleFeedback);
    eventBus.on('ritualBroadcast', handleRitualDrop);
    // Optionally, cleanup listeners on unmount
    return () => {
      eventBus.off('paymentSuccess', handlePayment);
      eventBus.off('userBanned', handleBan);
      eventBus.off('feedbackSubmitted', handleFeedback);
      eventBus.off('ritualBroadcast', handleRitualDrop);
    };
  }, []);
  const { userRole, hasSignedNDA, backendFlags } = useContext(AppContext);

  const isAuthorized = () => {
    if (userRole === 'creator' && hasSignedNDA) return true;
    if (userRole === 'influencer' && backendFlags.includes('promoAccess')) return true;
    if (userRole === 'tech' && backendFlags.includes('debugMode')) return true;
    return false;
  };

  return (
    <Router>
      <AppContextProvider>
        <div className="app-shell">
          <Header />
          <main className="main-content">
            {!hasSignedNDA && <NDAOverlay />}
            {isAuthorized() ? <Routes /> : <AccessDenied />}
          </main>
          <Footer />
        </div>
      </AppContextProvider>
    </Router>
  );
};

export default AppShell;

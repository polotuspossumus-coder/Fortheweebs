import React from 'react';
import LandingPage from './pages/LandingPage';
import CreatorApplication from './pages/CreatorApplication';
import FreeTrial from './pages/FreeTrial';
import ClaimVoucher from './pages/ClaimVoucher';
import ParentalControls from './pages/ParentalControls';
import Compliance2257 from './pages/Compliance2257';
import ApplicationReview from './components/admin/ApplicationReview';

// Simple router for landing site pages
function LandingSite() {
  const path = window.location.pathname;

  // Route to correct page based on URL
  if (path === '/apply') {
    return <CreatorApplication />;
  }

  if (path === '/trial') {
    return <FreeTrial />;
  }

  if (path === '/claim-voucher') {
    return <ClaimVoucher />;
  }

  if (path === '/parental-controls') {
    return <ParentalControls />;
  }

  if (path === '/compliance-2257') {
    return <Compliance2257 />;
  }

  if (path === '/admin/applications') {
    return <ApplicationReview />;
  }

  // Default to landing page
  return <LandingPage />;
}

export default LandingSite;

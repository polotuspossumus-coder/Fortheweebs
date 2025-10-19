import React from 'react';
import { useDevice } from '../hooks/useDevice';

const MobileUI = () => (
  <div className="text-red-500">
    <h2>Payments (Mobile)</h2>
    <p>Payment history and actions will appear here.</p>
  </div>
);

const DesktopUI = () => (
  <div className="text-red-500">
    <h2>Payments (Desktop)</h2>
    <p>Payment history and actions will appear here.</p>
  </div>
);

const PaymentPanel = () => {
  const isMobile = useDevice();
  return <div>{isMobile ? <MobileUI /> : <DesktopUI />}</div>;
};

export default PaymentPanel;

import React, { useState, useEffect } from "react";
import "./ParentalDisclaimer.css";

const DISCLAIMER_KEY = "parentalDisclaimerAccepted";

export const ParentalDisclaimer = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(DISCLAIMER_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="parental-disclaimer-overlay">
      <div className="parental-disclaimer-modal">
        <h2>Parental Advisory</h2>
        <p>
          This platform may contain mature or adult content. By clicking below, you acknowledge you are of legal age or have parental consent to access such material. Parental controls are available in settings.
        </p>
        <button onClick={handleAccept}>I Understand</button>
      </div>
    </div>
  );
};

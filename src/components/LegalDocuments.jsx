import { useNavigate } from "react-router-dom";
import "./LegalDocuments.css";

export const LegalDocuments = () => {
  const navigate = useNavigate();

  const handleAccept = () => {
    localStorage.setItem("legalAccepted", "true");
    navigate("/onboarding/next");
  };

  return (
    <div className="legal-container">
      <h1 className="legal-title">📜 Legal Documents</h1>

      <section className="legal-section">
        <h2>Terms of Service</h2>
        <p><strong>Version:</strong> 2.0.0 | <strong>Last Updated:</strong> 2023-10-11</p>
        <p>
          Version 2.0.0 of the Terms of Service for using this platform,
          replacing the following previous versions:
        </p>
      </section>

      <section className="legal-section">
        <h2>Privacy Policy</h2>
        <p><strong>Version:</strong> 2.0.0 | <strong>Last Updated:</strong> 2023-10-11</p>
        <p>
          This Privacy Policy outlines how we handle your data, protect your sovereignty,
          and ensure forensic moderation boundaries.
        </p>
      </section>

      <button className="legal-accept" onClick={handleAccept}>
        Accept & Continue
      </button>
    </div>
  );
};

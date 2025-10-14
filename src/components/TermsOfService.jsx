import React, { useState } from "react";
import "./TermsOfService.css";

const TERMS_TEXT = `# Fortheweebs Terms of Service

_Last updated: October 2025_

## 1. Introduction
Welcome to Fortheweebs (“the Platform”). By accessing or using Fortheweebs, you agree to be bound by these Terms of Service (“Terms”). These Terms govern your relationship with Fortheweebs, including your use of the Platform as a creator, subscriber, or visitor.
---
## 2. Platform Scope
Fortheweebs provides infrastructure for creators to publish content, manage subscriptions, and engage with their audience. Fortheweebs does not produce, endorse, or monitor creator content. The Platform is a neutral automation and orchestration service.
---
## 3. Creator Independence
Creators operate as independent entities. Fortheweebs does not employ, contract, or represent creators in any legal or editorial capacity. Creators are solely responsible for:
- The content they publish
- Their interactions with users
- Compliance with applicable laws and regulations
Fortheweebs assumes no responsibility or liability for creator actions or content.
---
## 4. Content Responsibility
Creators are fully responsible for the legality, accuracy, and appropriateness of their content. This includes but is not limited to:
- Copyrighted material
- Adult content
- Defamatory or misleading statements
- Violations of local, national, or international law
Fortheweebs does not pre-screen or moderate content and holds no obligation to do so.
---
## 5. Liability Disclaimer
Fortheweebs shall not be liable for:
- Any content posted by creators
- Any damages, losses, or disputes arising from creator activity
- Any consequences resulting from content takedowns, legal action, or third-party claims
- Any data breaches, technical failures, or future incidents that may arise from use of the Platform
Users and creators agree that Fortheweebs is not responsible for resolving any issues related to their content, conduct, or data exposure.
---
## 6. Indemnification
Creators agree to indemnify and hold harmless Fortheweebs, its founders, affiliates, and agents from any claims, liabilities, damages, or expenses (including legal fees) arising from:
- Their content
- Their conduct on the Platform
`;

export const TermsOfService = ({ onAccept }) => {
  const [accepted, setAccepted] = useState(false);

  return (
  <div className="terms-container">
      <h2>Terms of Service</h2>
      <div className="terms-content">
        <pre className="terms-pre">{TERMS_TEXT}</pre>
      </div>
  <label className="terms-label">
        <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
        I accept the Terms of Service
      </label>
      <button
        disabled={!accepted}
        className={`terms-button${!accepted ? " disabled" : ""}`}
        onClick={() => accepted && onAccept()}
      >
        Continue
      </button>
    </div>
  );
};

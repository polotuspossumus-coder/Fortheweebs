import React from "react";
import "./LegalLanding.css"; // Optional: external styling

export default function LegalLanding() {
  return (
    <section className="legal-landing">
      <img
        src="/assets/legal-scroll.png"
        alt="Ancient scroll with Fortheweebs seal"
        className="legal-image"
      />
      <h1>🛡️ Fortheweebs Legal Codex</h1>
      <p>
        Every ritual, ban, crown, and unlock is governed by sovereign law.
        Below you’ll find immutable documents that define our platform’s justice,
        access, and legacy protocols.
      </p>
      <ul>
        <li><a href="/src/components/TermsOfService.md" target="_blank" rel="noopener noreferrer">Terms of Ritual</a></li>
        <li><a href="/src/components/PrivacyScroll.md" target="_blank" rel="noopener noreferrer">Privacy Scroll</a></li>
        <li><a href="/src/components/ModerationProtocol.md" target="_blank" rel="noopener noreferrer">Moderation Protocol</a></li>
        <li><a href="/src/components/GraveyardTransferLedger.md" target="_blank" rel="noopener noreferrer">Graveyard Transfer Ledger</a></li>
      </ul>
    </section>
  );
}

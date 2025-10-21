import React from "react";
import "./MainLanding.css"; // Optional: external styling

export default function MainLanding() {
  return (
    <section className="main-landing">
      <div className="hero-text">
        <h1>Welcome to Fortheweebs</h1>
        <p>
          A sovereign platform where creators ascend through ritualized onboarding,
          mythic campaigns, and immortal legacy drops.
        </p>
        <a href="/onboarding" className="cta-button">Begin Your Ritual</a>
      </div>
      <div className="tier-preview">
        <h2>Choose Your Path</h2>
        <ul>
          <li>🌱 Free & General Access</li>
          <li>🌀 Supporter & Legacy Creators</li>
          <li>🛡️ Standard & Mythic Founders</li>
        </ul>
        <p>Every tier unlocks a chapter in your mythos.</p>
      </div>
    </section>
  );
}

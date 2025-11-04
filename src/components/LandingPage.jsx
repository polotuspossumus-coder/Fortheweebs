import React from "react";

const LandingPage = () => (
  <>
    <section className="bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Join the Rebellion. Build Your Legacy.</h1>
      <p className="mb-6">Fortheweebs is the sovereign platform for creators, rebels, and founders. Choose your tier. Unlock your tools. Immortalize your profile.</p>
      <a href="/signup" className="bg-purple-600 px-4 py-2 rounded">Become a Founder</a>
    </section>

    <section className="bg-gray-900 text-white p-8">
      <h2 className="text-2xl font-semibold mb-4">Tier Breakdown</h2>
      <table className="w-full text-left">
        <thead>
          <tr><th>Tier</th><th>Cost</th><th>Profit</th><th>Access</th></tr>
        </thead>
        <tbody>
          <tr><td>Mythic Founder</td><td>$200</td><td>100%</td><td>All rituals + CGI tribute</td></tr>
          <tr><td>Standard Founder</td><td>$100 + $100</td><td>100%</td><td>Founder status + CGI</td></tr>
          <tr><td>Legacy Creator</td><td>$100</td><td>95%</td><td>Creator tools</td></tr>
          <tr><td>Supporter Creator</td><td>$50</td><td>85%</td><td>Limited tools</td></tr>
          <tr><td>General Access</td><td>$15 + $5/mo</td><td>80%</td><td>Feed + basic tools</td></tr>
        </tbody>
      </table>
    </section>

    <section className="bg-gray-800 text-white p-8">
      <h2 className="text-xl font-semibold mb-4">Sovereign Governance</h2>
      <ul className="list-disc ml-6">
        <li>Immutable block protocol</li>
        <li>AI-led moderation</li>
        <li>Ban/crown/graveyard logic</li>
      </ul>
    </section>

    <section className="bg-gray-700 text-white p-8">
      <h2 className="text-xl font-semibold mb-4">Creative Arsenal</h2>
      {/* Add more content here as needed */}
    </section>
  </>
);

export default LandingPage;

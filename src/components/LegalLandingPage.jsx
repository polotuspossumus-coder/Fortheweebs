import React from "react";

export const LegalLandingPage = () => (
  <div className="bg-gradient-to-b from-blue-200 via-pink-200 to-purple-200 text-white text-center p-8 relative overflow-hidden min-h-screen">
    <h1 className="text-5xl font-bold mb-2 animate-bounce">LEGAL DOCUMENTS</h1>
    <h2 className="text-4xl font-extrabold mb-4 tracking-wide">FORTHEWEEBS</h2>
    <p className="text-lg italic mb-6">Transparency. Trust. Community Sovereignty.</p>

    {/* Character Banner */}
    <div className="grid grid-cols-3 gap-4 items-center justify-center mb-8">
      <img src="/characters/anime-girl-bikini.png" alt="Anime Girl Bikini" className="rounded-lg shadow-lg hover:scale-105 transition-transform duration-300" />
      <img src="/characters/trading-card-boy.png" alt="Trading Card Tactician" className="rounded-lg shadow-lg hover:rotate-3 transition-transform duration-300" />
      <img src="/characters/anime-girl-popsicle.png" alt="Anime Girl Popsicle" className="rounded-lg shadow-lg hover:scale-105 transition-transform duration-300" />
    </div>

    {/* Nerdverse Cast */}
    <div className="flex flex-wrap justify-center gap-6 mb-6">
      <img src="/characters/jedi-archivist.png" alt="Jedi Archivist" className="w-32 h-32 rounded-full shadow-md" />
      <img src="/characters/mecha-pilot.png" alt="Mecha Pilot" className="w-32 h-32 rounded-full shadow-md" />
      <img src="/characters/hacker-elf.png" alt="Hacker Elf" className="w-32 h-32 rounded-full shadow-md" />
      <img src="/characters/dungeon-master.png" alt="Dungeon Master" className="w-32 h-32 rounded-full shadow-md" />
    </div>

    {/* Legal Documents List */}
    <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-8 max-w-2xl mx-auto shadow-lg">
      <h3 className="text-2xl font-semibold mb-4">Available Legal Documents</h3>
      <ul className="text-lg text-left space-y-2">
        <li><a href="/legal/terms-of-service" className="text-blue-100 hover:underline">Terms of Service</a></li>
        <li><a href="/legal/privacy-policy" className="text-blue-100 hover:underline">Privacy Policy</a></li>
        <li><a href="/legal/creator-agreement" className="text-blue-100 hover:underline">Creator Agreement</a></li>
        <li><a href="/legal/acceptance-log" className="text-blue-100 hover:underline">Acceptance Log</a></li>
      </ul>
    </div>

    {/* Enter Button */}
    <a href="/" className="inline-block mt-8 px-8 py-4 bg-purple-600 text-white rounded-full font-bold text-xl hover:bg-purple-700 animate-pulse">
      ENTER
    </a>
  </div>
);

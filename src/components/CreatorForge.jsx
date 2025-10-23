import React from "react";

export default function CreatorForge() {
  const tools = [
    'Canvas Forge',
    'Sound Forge',
    'Video Forge',
    'CGI Generator',
    'Analytics Panel',
    'Campaign Triggers',
    'Artifact Monetization',
    'Moderation Logs',
  ];

  return (
    <div className="bg-black text-white p-8 rounded-xl max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">🎨 Fortheweebs Creator Forge</h1>
      <div className="grid grid-cols-2 gap-6">
        {tools.map((tool) => (
          <button
            key={tool}
            className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-lg shadow-md transition-all"
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
}

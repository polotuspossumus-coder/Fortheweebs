import React from "react";
import { getCreatorTools } from "../utils/getCreatorTools";

export default function ToolAccessUI({ userTier }) {
  const tools = getCreatorTools(userTier);

  return (
    <div className="bg-gradient-to-br from-black via-purple-900 to-black text-white p-8 rounded-xl shadow-xl max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">🎨 Fortheweebs Creator Forge</h1>
      <p className="mb-4 text-lg">Tier: <strong>{userTier}</strong></p>
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

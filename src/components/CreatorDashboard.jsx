import React from "react";
import { getCreatorTools } from "../utils/getCreatorTools";

export default function CreatorDashboard({ userTier }) {
  const tools = getCreatorTools(userTier);

  return (
    <div className="bg-black text-white p-6 rounded-lg max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Fortheweebs Creator Dashboard</h1>
      <p className="mb-6">Tier: {userTier}</p>
      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool) => (
          <button
            key={tool}
            className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded shadow"
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
}

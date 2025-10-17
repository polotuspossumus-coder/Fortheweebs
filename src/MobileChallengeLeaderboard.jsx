import React from "react";
/**
 * @param {{ entries: Array<{creator: string, votes: number, slabName: string}> }} props
 */
export default function MobileChallengeLeaderboard({ entries }) {
  return (
    <div className="p-4 max-w-sm mx-auto space-y-3" aria-label="Challenge leaderboard">
      {Array.isArray(entries) && entries.map((entry, i) => (
        <div key={i} className="bg-white rounded shadow p-3">
          <h3 className="text-base font-bold">{entry.creator}</h3>
          <p className="text-sm text-gray-600">Votes: {entry.votes}</p>
          <p className="text-xs text-gray-500">Slab: {entry.slabName}</p>
        </div>
      ))}
    </div>
  );
}

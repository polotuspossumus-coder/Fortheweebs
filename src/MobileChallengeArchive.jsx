import React from "react";
/**
 * @param {{ challenges: Array<{title: string, winner: string, date: string}> }} props
 */
export default function MobileChallengeArchive({ challenges }) {
  return (
    <div className="p-4 max-w-sm mx-auto space-y-3" aria-label="Challenge archive">
      {Array.isArray(challenges) && challenges.map((c, i) => (
        <div key={i} className="bg-white rounded shadow p-3">
          <h3 className="text-base font-bold">{c.title}</h3>
          <p className="text-sm text-gray-600">{c.winner}</p>
          <p className="text-xs text-gray-500">{c.date}</p>
        </div>
      ))}
    </div>
  );
}

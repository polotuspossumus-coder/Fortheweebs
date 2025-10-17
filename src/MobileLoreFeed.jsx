import React from "react";
/**
 * @param {{ entries: Array<{id: string, lore: string, userId: string}> }} props
 */
export default function MobileLoreFeed({ entries }) {
  return (
    <div className="p-4 space-y-4 max-w-sm mx-auto" aria-label="Lore feed">
      {Array.isArray(entries) && entries.map(entry => (
        <div key={entry.id} className="bg-white rounded shadow p-3">
          <p className="text-sm text-gray-800">{entry.lore}</p>
          <p className="text-xs text-gray-500 mt-1">By {entry.userId}</p>
        </div>
      ))}
    </div>
  );
}

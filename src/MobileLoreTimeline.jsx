import React from "react";
/**
 * @param {{ timeline: Array<{title: string, time: string, remixOf?: string}> }} props
 */
export default function MobileLoreTimeline({ timeline }) {
  return (
    <div className="p-4 max-w-sm mx-auto space-y-3" aria-label="Lore timeline">
      {Array.isArray(timeline) && timeline.map((entry, i) => (
        <div key={i} className="bg-white rounded shadow p-3">
          <h3 className="text-base font-bold">{entry.title}</h3>
          <p className="text-sm text-gray-600">{entry.time}</p>
          {entry.remixOf && <p className="text-xs text-gray-500">Remix of {entry.remixOf}</p>}
        </div>
      ))}
    </div>
  );
}

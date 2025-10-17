import React from "react";
/**
 * @param {{ tags: string[] }} props
 */
export default function MobileRemixDNA({ tags }) {
  const dna = Array.isArray(tags) ? [...tags].sort().join('-') : '';
  return (
    <div className="p-4 max-w-sm mx-auto" aria-label="Remix DNA">
      <h2 className="text-lg font-bold mb-2">Remix DNA</h2>
      <p className="text-sm text-gray-700">{dna}</p>
    </div>
  );
}

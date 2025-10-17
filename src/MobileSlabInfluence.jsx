import React from 'react';
/**
 * @param {{ score: {forks: number, endorsements: number, reach: number, total: number} }} props
 */
export default function MobileSlabInfluence({ score }) {
  return (
    <div className="p-4 max-w-sm mx-auto" aria-label="Slab influence">
      <h2 className="text-lg font-bold mb-2">Slab Influence</h2>
      <p className="text-sm">Forks: {score.forks}</p>
      <p className="text-sm">Endorsements: {score.endorsements}</p>
      <p className="text-sm">Reach: {score.reach}</p>
      <p className="text-sm font-bold mt-2">Total Score: {score.total}</p>
    </div>
  );
}

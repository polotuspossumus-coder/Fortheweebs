import React from "react";
/**
 * @param {{ stats: {totalSlabs: number, totalForks: number, endorsements: number, earnings: number} }} props
 */
export default function MobileCreatorAnalytics({ stats }) {
  return (
    <div className="p-4 max-w-sm mx-auto" aria-label="Creator analytics">
      <h2 className="text-lg font-bold mb-2">Your Stats</h2>
      <p className="text-sm">Slabs Published: {stats.totalSlabs}</p>
      <p className="text-sm">Remixes Forked: {stats.totalForks}</p>
      <p className="text-sm">Validator Endorsements: {stats.endorsements}</p>
      <p className="text-sm">Total Earnings: ${stats.earnings}</p>
    </div>
  );
}

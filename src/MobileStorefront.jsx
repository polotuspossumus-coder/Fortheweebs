import React from "react";
/**
 * @param {{ tier: string|number }} props
 */
export default function MobileStorefront({ tier }) {
  return (
    <div className="p-4 max-w-sm mx-auto" aria-label="Storefront">
      <h2 className="text-lg font-bold mb-2">Your Storefront</h2>
      <p className="text-sm mb-4">Tier {tier} – You keep {tier}% of profits</p>
      <button className="w-full bg-green-600 text-white py-2 rounded" aria-label="View earnings">View Earnings</button>
      <button className="mt-2 w-full bg-indigo-600 text-white py-2 rounded" aria-label="Upgrade tier">Upgrade Tier</button>
    </div>
  );
}

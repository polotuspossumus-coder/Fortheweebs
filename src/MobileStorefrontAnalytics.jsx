import React from "react";
/**
 * @param {{ stats: {total: number, sold: number, topSlab: string, tier: string|number, profitShare: number} }} props
 */
export default function MobileStorefrontAnalytics({ stats }) {
  return (
    <div className="p-4 max-w-sm mx-auto" aria-label="Storefront analytics">
      <h2 className="text-lg font-bold mb-2">Storefront Stats</h2>
      <p className="text-sm">Total Earnings: ${stats.total}</p>
      <p className="text-sm">Slabs Sold: {stats.sold}</p>
      <p className="text-sm">Top Slab: {stats.topSlab}</p>
      <p className="text-sm">Tier: {stats.tier} – {stats.profitShare}% Profit</p>
    </div>
  );
}

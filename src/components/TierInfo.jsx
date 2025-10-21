import React from 'react';

const tierMap = {
  'General Access': { next: 'Supporter Creator', cost: 35, profit: '85%' },
  'Supporter Creator': { next: 'Legacy Creator', cost: 50, profit: '95%' },
  'Legacy Creator': { next: 'Standard Founder', cost: 100, profit: '100%' },
  'Standard Founder': { next: 'Mythic Founder', cost: 0, profit: '100%' },
};

export default function TierInfo({ currentTier }) {
  const info = tierMap[currentTier];
  if (!info) return <div>Tier not upgradeable.</div>;
  return (
    <div>
      <div>Current Tier: <b>{currentTier}</b></div>
      <div>Next Tier: <b>{info.next}</b></div>
      <div>Upgrade Cost: <b>{info.cost}</b></div>
      <div>Profit Retention: <b>{info.profit}</b></div>
    </div>
  );
}

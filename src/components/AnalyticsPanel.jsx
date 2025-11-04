import React from 'react';

/**
 * AnalyticsPanel component displays user stats.
 * @param stats - Object with views, exports, campaigns
 */
export default function AnalyticsPanel({ stats }) {
  return (
    <div>
      <p>Views: {stats.views}</p>
      <p>Exports: {stats.exports}</p>
      <p>Campaigns: {stats.campaigns}</p>
    </div>
  );
}

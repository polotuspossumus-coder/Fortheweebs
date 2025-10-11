// TypeScript interfaces for RemixBadge and RemixLineageTimelineProps

/**
 * @typedef {Object} RemixBadge
 * @property {string} creatorId
 * @property {string} tier
 * @property {number} timestamp
 * @property {string} lineageHash
 * @property {{ label: string, color: string, icon: string }} badge
 */

/**
 * @param {{ badges: RemixBadge[] }} props
 */

import React from "react";

export const RemixLineageTimeline = ({ badges }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {badges
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((badge) => (
          <div
            key={badge.lineageHash}
            style={{
              backgroundColor: badge.badge.color,
              padding: "12px",
              borderRadius: "8px",
              color: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontSize: "1.2rem" }}>{badge.badge.icon} {badge.badge.label}</div>
            <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              {new Date(badge.timestamp).toLocaleString()}
            </div>
            <div style={{ fontSize: "0.7rem", wordBreak: "break-all", marginTop: "4px" }}>
              <strong>Hash:</strong> {badge.lineageHash}
            </div>
          </div>
        ))}
    </div>
  );
};

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

export const BadgeRegistry = ({ badges }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "16px",
        padding: "16px",
      }}
    >
      {badges.map((badge) => (
        <div
          key={badge.lineageHash}
          style={{
            backgroundColor: badge.badge.color,
            borderRadius: "8px",
            padding: "12px",
            color: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ fontSize: "1.5rem" }}>{badge.badge.icon}</div>
          <div style={{ fontWeight: "bold", marginTop: "4px" }}>{badge.badge.label}</div>
          <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
            {new Date(badge.timestamp).toLocaleDateString()}
          </div>
          <div style={{ fontSize: "0.6rem", wordBreak: "break-word", marginTop: "6px" }}>
            {badge.lineageHash.slice(0, 12)}…
          </div>
        </div>
      ))}
    </div>
  );
};

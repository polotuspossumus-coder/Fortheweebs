import React from 'react';

/**
 * @param {{ tier: string, label: string, color: string, icon: string }} props
 */
export const CreatorBadge = ({ label, color, icon }) => {
  // Use CSS variable for dynamic badge color; fall back to #666 in CSS
  const style = color ? { ['--badge-color']: color } : undefined;
  return (
    <div className="badge-wrap">
      <div className="badge-card" style={style}>
        <span className="badge-label">{icon}</span>
        <span>{label}</span>
      </div>
    </div>
  );
};

// StatusPanel.jsx — Creator Status Viewer

import React from "react";
import { getCreatorStatus } from "../utils/creator-status";

export default function StatusPanel({ creator }) {
  const status = getCreatorStatus(creator);

  return (
    <div className="status-panel">
      <h2>🧾 Creator Status</h2>
      <p><strong>Tier:</strong> {status.tier}</p>
      <p><strong>Unlocked:</strong> {status.unlocked ? "✅" : "❌"}</p>
      <p><strong>Banned:</strong> {status.banned ? "🪦 Yes" : "🛡️ No"}</p>
      <p><strong>Access:</strong> {status.access.join(", ")}</p>
      <p><strong>Profit Retention:</strong> {status.profit}%</p>
    </div>
  );
}

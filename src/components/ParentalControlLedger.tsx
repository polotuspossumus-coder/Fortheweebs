import React from "react";
import { getParentalControlStatus } from "../utils/parentalControlState.js";

export const ParentalControlLedger = () => {
  const status = getParentalControlStatus();

  return (
    <div className="bg-gray-900 text-white p-4 rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">�️ Parental Control Ledger</h2>
      <ul className="text-sm space-y-1">
        <li><strong>Status:</strong> {status.enabled ? "Enabled" : "Disabled"}</li>
        <li><strong>Triggered By:</strong> {status.triggeredBy}</li>
        <li><strong>Timestamp:</strong> {status.timestamp || "—"}</li>
      </ul>
    </div>
  );
};

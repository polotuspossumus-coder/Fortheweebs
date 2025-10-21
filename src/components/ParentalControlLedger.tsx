import React from "react";

export type LogEntry = {
  action: string; // e.g., "Rating changed to PG-13"
  timestamp: string; // ISO 8601 format
  details?: string; // Optional extra info
};

export const ParentalControlLedger = ({ logs }: { logs: LogEntry[] }) => (
  <div className="bg-gray-50 border-l-4 border-gray-400 text-gray-800 p-6 rounded mb-6">
    <h3 className="text-xl font-bold mb-4">📜 Parental Control Ledger</h3>
    <ul className="space-y-4">
      {logs.map((log, index) => (
        <li key={index} className="border-b pb-2">
          <div className="font-semibold">{log.action}</div>
          <div className="text-sm text-gray-600">{log.timestamp}</div>
          {log.details && <div className="text-sm mt-1">{log.details}</div>}
        </li>
      ))}
    </ul>
  </div>
);

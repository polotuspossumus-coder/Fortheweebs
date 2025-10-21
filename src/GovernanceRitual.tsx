import React, { useState } from "react";
import ledgerData from "./codename-timeline.json" with { type: "json" };

type LedgerEntry = {
  version: string;
  codename: string;
  date: string;
  summary: string;
};

type Action = "ban" | "crown" | "resurrect";

const actions: Record<Action, string> = {
  ban: "🔨 Ban Proposal",
  crown: "👑 Crown Restoration",
  resurrect: "⚰️ Graveyard Resurrection"
};

export default function GovernanceRitual() {
  const [selected, setSelected] = useState<Action | null>(null);

  return (
    <div className="ritual">
      <h1>🛡️ Vanguard Governance Rituals</h1>
      <div className="actions">
        {Object.entries(actions).map(([key, label]) => (
          <button key={key} onClick={() => setSelected(key as Action)}>
            {label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="form">
          <h2>{actions[selected]}</h2>
          <input type="text" placeholder="Enter user ID or artifact ID" />
          <textarea placeholder="Reason, context, or legacy note" />
          <button>Submit Ritual</button>
        </div>
      )}

      <div className="ledger">
        <h2>📜 Legacy Timeline</h2>
        <ul>
          {ledgerData.map((entry: LedgerEntry) => (
            <li key={entry.version}>
              <h3>{entry.codename} ({entry.version})</h3>
              <p><strong>Date:</strong> {entry.date}</p>
              <p>{entry.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

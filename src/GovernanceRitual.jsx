import React, { useState } from "react";
import ledgerData from "./codename-timeline.json";

const actions = {
  ban: "🔨 Ban Proposal",
  crown: "👑 Crown Restoration",
  resurrect: "⚰️ Graveyard Resurrection"
};

export default function GovernanceRitual() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="ritual">
      <h1>🛡️ Vanguard Governance Rituals</h1>
      <div className="actions">
        {Object.entries(actions).map(([key, label]) => (
          <button key={key} onClick={() => setSelected(key)}>
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
          {ledgerData.map((entry) => (
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

import React, { useState } from "react";
import ledgerData from "./codename-timeline.json";

const actions = {
  ban: "🔨 Ban Proposal",
  crown: "👑 Crown Restoration",
  resurrect: "⚰️ Graveyard Resurrection"
};

export default function GovernanceRitual() {
  const [selected, setSelected] = useState(null);
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!targetId || !reason) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/governance-ritual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: selected,
          targetId,
          reason,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message || 'Ritual submitted successfully' });
        setTargetId("");
        setReason("");
        setSelected(null);
      } else {
        setResult({ success: false, message: data.error || 'Submission failed' });
      }
    } catch (error) {
      console.error('Ritual submission error:', error);
      setResult({ success: false, message: 'Network error: ' + error.message });
    } finally {
      setSubmitting(false);
    }
  };

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
          <input 
            type="text" 
            placeholder="Enter user ID or artifact ID" 
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            disabled={submitting}
          />
          <textarea 
            placeholder="Reason, context, or legacy note" 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
          />
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Ritual'}
          </button>
          
          {result && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              borderRadius: '8px',
              background: result.success ? '#4CAF50' : '#f44336',
              color: 'white'
            }}>
              {result.message}
            </div>
          )}
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

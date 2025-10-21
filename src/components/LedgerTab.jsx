import { useEffect, useState } from 'react';

export default function LedgerTab() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch('/ledger/public')
      .then(res => res.json())
      .then(data => setEntries(data.reverse()));
  }, []);

  return (
    <div>
      <h2>Immutable Ledger</h2>
      {entries.map((entry, i) => (
        <div key={i} className="ledger-entry">
          <p><strong>{entry.actionType.toUpperCase()}</strong> — {new Date(entry.timestamp).toLocaleString()}</p>
          <p><strong>Actor:</strong> {entry.actorId} | <strong>Target:</strong> {entry.targetId}</p>
          <pre>{JSON.stringify(entry.metadata, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}

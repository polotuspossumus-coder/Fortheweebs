import { useEffect, useState } from 'react';

export default function GraveyardViewer() {
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    fetch('/ledger/public')
      .then(res => res.json())
      .then(data => setLedger(data.filter(entry => entry.actionType === 'ban')));
  }, []);

  const handleRemix = async (id) => {
    await fetch('/rituals/remix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.token}` },
      body: JSON.stringify({ tributeId: id, remixType: 'standard' }),
    });
  };

  return (
    <div>
      <h2>Graveyard Ledger</h2>
      {ledger.map(entry => (
        <div key={entry.timestamp} className="graveyard-entry">
          <p><strong>Banned:</strong> {entry.targetId}</p>
          <p><strong>By:</strong> {entry.actorId}</p>
          <p><strong>Reason:</strong> {entry.metadata.reason}</p>
          <button onClick={() => handleRemix(entry.targetId)}>Remix Tribute</button>
        </div>
      ))}
    </div>
  );
}

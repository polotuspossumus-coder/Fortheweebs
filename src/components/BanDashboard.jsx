import { useEffect, useState } from 'react';

export default function BanDashboard() {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetch('/propose-ban')
      .then(res => res.json())
      .then(data => setProposals(data));
  }, []);

  const handleDecision = async (id, approve) => {
    await fetch('/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.token}` },
      body: JSON.stringify({ targetId: id, reason: approve ? 'Approved by Jacob' : 'Rejected by Jacob' }),
    });
  };

  return (
    <div>
      <h2>Ban Proposals</h2>
      {proposals.map(p => (
        <div key={p.id} className="proposal-card">
          <p><strong>Target:</strong> {p.targetId}</p>
          <p><strong>Reason:</strong> {p.reason}</p>
          <button onClick={() => handleDecision(p.targetId, true)}>Approve</button>
          <button onClick={() => handleDecision(p.targetId, false)}>Reject</button>
        </div>
      ))}
    </div>
  );
}

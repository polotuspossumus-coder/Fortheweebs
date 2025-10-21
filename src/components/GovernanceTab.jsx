import { useEffect, useState } from 'react';

export default function GovernanceTab() {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetch('/votes')
      .then(res => res.json())
      .then(data => setProposals(data));
  }, []);

  const castVote = async (id, vote) => {
    await fetch(`/votes/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.token}` },
      body: JSON.stringify({ vote }),
    });
  };

  return (
    <div>
      <h2>Governance Proposals</h2>
      {proposals.map(p => (
        <div key={p.id} className="proposal-card">
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <button onClick={() => castVote(p.id, 'yes')}>Vote Yes</button>
          <button onClick={() => castVote(p.id, 'no')}>Vote No</button>
        </div>
      ))}
    </div>
  );
}

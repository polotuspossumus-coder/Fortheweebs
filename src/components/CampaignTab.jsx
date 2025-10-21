import { useEffect, useState } from 'react';

export default function CampaignTab() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetch('/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data));
  }, []);

  const contribute = async (id) => {
    await fetch(`/campaigns/${id}/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.token}` },
    });
  };

  return (
    <div>
      <h2>Active Campaigns</h2>
      {campaigns.map(c => (
        <div key={c.id} className="campaign-card">
          <h3>{c.title}</h3>
          <p>{c.description}</p>
          <p><strong>Unlock Tier:</strong> {c.unlockTier}</p>
          <button onClick={() => contribute(c.id)}>Contribute</button>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from 'react';
import axios from 'axios';

export function CampaignStatus({ userId }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    axios.get(`/api/campaign/status?userId=${userId}`).then(res => {
      setStatus(res.data);
    });
  }, [userId]);

  if (!status) return <p>Loading campaign status...</p>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold">Your Campaign</h2>
      <p>Status: {status.state}</p>
      <p>Perks: {status.perks.join(', ')}</p>
      <p>Memory Score: {status.memoryScore}</p>
    </div>
  );
}

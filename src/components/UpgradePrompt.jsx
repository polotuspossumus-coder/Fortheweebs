import React, { useState } from 'react';
import axios from 'axios';

export default function UpgradePrompt({ userId, currentTier }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/upgrade-tier', { userId });
      setStatus(res.data.status);
    } catch (e) {
      setError(e.response?.data?.error || 'Upgrade failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-950 p-6 rounded-lg text-white text-center">
      <h3 className="text-xl font-bold mb-2">Upgrade Your Tier</h3>
      <p className="mb-4">Current Tier: {currentTier}</p>
      <button
        onClick={handleUpgrade}
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? 'Upgrading...' : 'Ritualize Upgrade'}
      </button>
      {status && <p className="mt-4 text-green-400">Upgrade successful. Welcome to your new tier.</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  );
}

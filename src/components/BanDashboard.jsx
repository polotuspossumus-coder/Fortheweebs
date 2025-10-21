import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BanDashboard() {
  const [bans, setBans] = useState([]);

  useEffect(() => {
    async function fetchBans() {
      try {
        const res = await axios.get('/api/ban-queue');
        setBans(res.data);
      } catch {
        setBans([]);
      }
    }
    fetchBans();
  }, []);

  async function handleBan(id, verdict) {
    await axios.post('/api/ban-verdict', { banId: id, verdict });
    setBans((prev) =>
      prev.map((b) => (b._id === id ? { ...b, verdict, reviewed: true } : b))
    );
  }

  return (
    <section className="p-6 bg-black text-white">
      <h2 className="text-3xl font-bold mb-6">Ban Queue</h2>
      <div className="space-y-6">
        {bans.map((b) => (
          <div key={b._id} className="border border-pink-600 p-4 rounded-lg">
            <p><strong>User:</strong> {b.userId}</p>
            <p><strong>Reason:</strong> {b.reason}</p>
            <p><strong>Status:</strong> {b.reviewed ? `Verdict: ${b.verdict}` : 'Pending'}</p>
            {!b.reviewed && (
              <div className="space-x-2 mt-4">
                {['approved', 'rejected', 'graveyarded'].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleBan(b._id, v)}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-1 px-3 rounded"
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

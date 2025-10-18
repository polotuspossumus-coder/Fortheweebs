import { useState, useEffect } from 'react';

export default function ReferralPortal() {
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    // Mocked fetch — replace with DB call
    setReferralCode('ftw-kitsune');
    setReferrals([
      { name: 'mecha.muse', joined: '2025-10-17', tier: 'starter' },
      { name: 'shrinewave', joined: '2025-10-18', tier: 'basic-access' },
    ]);
  }, []);

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">🔁 Creator Referral Engine</h1>
      <p className="mb-4 max-w-xl">
        Invite creators and track your referral lineage. Earn remix perks, validator memory boosts, or governance votes.
      </p>

      <div className="bg-gray-900 p-4 rounded mb-6">
        <p className="text-sm text-purple-400">Your Referral Link:</p>
        <p className="text-lg font-mono">{`https://fortheweebs.com/create?ref=${referralCode}`}</p>
      </div>

      <h2 className="text-xl font-semibold mb-4">🧬 Referral Lineage</h2>
      <ul className="space-y-2 text-sm">
        {referrals.map((r, i) => (
          <li key={i} className="bg-gray-800 p-3 rounded">
            <p><strong>{r.name}</strong> joined on {r.joined}</p>
            <p className="text-gray-400">Tier: {r.tier}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

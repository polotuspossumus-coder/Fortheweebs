import { useState, useEffect } from 'react';

export default function AffiliateDashboard() {
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState({ clicks: 0, signups: 0, earnings: '$0' });

  useEffect(() => {
    // Mocked fetch — replace with real DB call
    setReferralCode('ftw-kitsune');
    setStats({ clicks: 128, signups: 34, earnings: '$340' });
  }, []);

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">🔗 Affiliate Tracking</h1>
      <p className="mb-4 max-w-xl">
        Share your referral link to earn perks and track your impact. Every signup is a legacy milestone.
      </p>

      <div className="bg-gray-900 p-4 rounded mb-6">
        <p className="text-sm text-purple-400">Your Referral Link:</p>
        <p className="text-lg font-mono">{`https://fortheweebs.com/create?ref=${referralCode}`}</p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
        <li className="bg-gray-800 p-4 rounded">
          <p className="text-purple-400 uppercase tracking-wide">Clicks</p>
          <p className="text-xl font-bold">{stats.clicks}</p>
        </li>
        <li className="bg-gray-800 p-4 rounded">
          <p className="text-purple-400 uppercase tracking-wide">Signups</p>
          <p className="text-xl font-bold">{stats.signups}</p>
        </li>
        <li className="bg-gray-800 p-4 rounded">
          <p className="text-purple-400 uppercase tracking-wide">Earnings</p>
          <p className="text-xl font-bold">{stats.earnings}</p>
        </li>
      </ul>
    </section>
  );
}

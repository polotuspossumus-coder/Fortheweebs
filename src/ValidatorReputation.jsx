import { useEffect, useState } from 'react';

export default function ValidatorReputation() {
  const [profile] = useState({
    name: 'kitsune.eth',
    approvals: 42,
    remixImpact: 17,
    governanceVotes: 9,
    score: 88,
    badges: ['Lore Guardian', 'Protocol Steward'],
  });

  useEffect(() => {
    // Replace with real fetch
    console.log('Fetching validator reputation...');
  }, []);

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">🧠 Validator Reputation</h1>
      <p className="mb-4 max-w-xl">
        Your sovereign score reflects your impact across lore approvals, remix lineage, and governance chains.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-purple-400 uppercase tracking-wide">Approvals</p>
          <p className="text-xl font-bold">{profile.approvals}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-purple-400 uppercase tracking-wide">Remix Impact</p>
          <p className="text-xl font-bold">{profile.remixImpact}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-purple-400 uppercase tracking-wide">Governance Votes</p>
          <p className="text-xl font-bold">{profile.governanceVotes}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded col-span-3">
          <p className="text-purple-400 uppercase tracking-wide">Sovereign Score</p>
          <p className="text-3xl font-bold">{profile.score}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded col-span-3">
          <p className="text-purple-400 uppercase tracking-wide">Badges</p>
          <ul className="list-disc ml-6 mt-2">
            {profile.badges.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

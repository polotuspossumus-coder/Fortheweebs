import Link from 'next/link';

export default function ValidatorDashboard() {
  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">🧠 Validator Memory</h1>
      <p className="mb-4 max-w-xl">
        Every validator action is logged, queryable, and immortalized. This dashboard tracks approvals, lore reviews, remix lineage, and governance chain interactions.
      </p>

      <ul className="list-disc pl-6 mb-6 text-sm text-gray-300">
        <li>Approve or reject creator lore submissions</li>
        <li>Log remix lineage and ritual forks</li>
        <li>Track governance chain votes and escalations</li>
        <li>View validator history and memory logs</li>
      </ul>

      <Link
        href="/validator/log"
        className="inline-block bg-purple-700 hover:bg-purple-900 transition px-6 py-3 rounded text-white font-semibold"
      >
        Access Memory Logger
      </Link>
    </section>
  );
}

import Link from 'next/link';

export default function LandingPage() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold mb-6">🌌 Fortheweebs</h1>
        <p className="text-lg mb-8">
          The sovereign platform for creators, validators, and remixers. Immortalize your lore, spawn rituals, and govern your legacy.
        </p>
        <div className="space-x-4">
          <Link href="/create" className="bg-purple-700 hover:bg-purple-900 px-6 py-3 rounded font-semibold">Join as Creator</Link>
          <Link href="/govern" className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded font-semibold">Enter Governance</Link>
        </div>
        <p className="mt-10 text-sm text-gray-400">Built for global access. Powered by mythic protocol.</p>
      </div>
    </section>
  );
}

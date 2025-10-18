import Link from 'next/link';

export default function Rituals() {
  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">🧙 Ritual Engine</h1>
      <p className="mb-4 max-w-xl">
        Spawn, fork, or join creator rituals. Each ritual is a programmable event: lore drops, remix chains, validator votes, or governance escalations.
      </p>

      <Link
        href="/rituals/spawn"
        className="inline-block bg-purple-700 hover:bg-purple-900 px-6 py-3 rounded"
      >
        Spawn New Ritual
      </Link>
    </section>
  );
}

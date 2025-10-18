import { useRouter } from 'next/router';

export default function Success() {
  const { query } = useRouter();
  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">✅ Welcome, Creator</h1>
      <p className="mb-4">You’ve successfully joined the <strong>{query.tier}</strong> tier.</p>
      <p className="mb-6">Your lore, rituals, and validator memory await. Begin your legacy below.</p>

      <ul className="list-disc pl-6 text-sm text-gray-300">
        <li><a href="/lore/submit" className="underline text-purple-400">Submit Lore</a></li>
        <li><a href="/rituals" className="underline text-purple-400">Join Ritual</a></li>
        <li><a href="/dashboard" className="underline text-purple-400">Access Creator Dashboard</a></li>
      </ul>
    </section>
  );
}

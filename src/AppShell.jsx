import Link from 'next/link';

export default function AppShell() {
  return (
    <section className="min-h-screen bg-black text-white px-4 py-6">
      <nav className="flex justify-between items-center mb-6">
        <Link href="/" className="text-xl font-bold">FTW</Link>
        <div className="space-x-4 text-sm">
          <Link href="/create">Create</Link>
          <Link href="/govern">Govern</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <main>
        <h1 className="text-2xl font-bold mb-4">📱 Fortheweebs Mobile</h1>
        <p className="text-sm text-gray-300 mb-6">
          Access rituals, lore, validator memory, and remix lineage from any device, anywhere.
        </p>
        <ul className="space-y-2 text-purple-400 text-sm">
          <li><Link href="/lore/submit">Submit Lore</Link></li>
          <li><Link href="/rituals">Join Ritual</Link></li>
          <li><Link href="/remix">View Remix Graph</Link></li>
          <li><Link href="/legal">Legal Slabs</Link></li>
        </ul>
      </main>
    </section>
  );
}

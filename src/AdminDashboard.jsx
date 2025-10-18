import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">🛡️ Admin Control Panel</h1>
      <ul className="space-y-4">
        <li><Link href="/admin/lore" className="underline text-purple-400">Review Lore Submissions</Link></li>
        <li><Link href="/admin/validators" className="underline text-purple-400">View Validator Logs</Link></li>
        <li><Link href="/admin/rituals" className="underline text-purple-400">Manage Rituals</Link></li>
        <li><Link href="/admin/creators" className="underline text-purple-400">Creator Tier Management</Link></li>
      </ul>
    </section>
  );
}

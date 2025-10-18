import Link from 'next/link';

export default function SupportDashboard() {
  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">🛠️ Support Crew Dashboard</h1>
      <p className="mb-4 max-w-xl">
        Welcome backstage. You have access to validator memory, lore approvals, ritual scheduling, and analytics. All actions are logged and queryable.
      </p>

      <ul className="space-y-4">
        <li><Link href="/validator/log" className="underline text-purple-400">View Validator Memory</Link></li>
        <li><Link href="/admin/lore" className="underline text-purple-400">Approve Lore Submissions</Link></li>
        <li><Link href="/rituals/schedule" className="underline text-purple-400">Schedule New Ritual</Link></li>
        <li><Link href="/dashboard/analytics" className="underline text-purple-400">Monitor Creator Analytics</Link></li>
        <li><Link href="/legal" className="underline text-purple-400">Review Legal Slabs</Link></li>
      </ul>
    </section>
  );
}

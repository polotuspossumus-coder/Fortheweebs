import Link from 'next/link';

export default function First25Onboarding() {
  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">🔥 First 25 Creators</h1>
      <p className="mb-4 max-w-xl">
        You’re among the mythic few. As one of the first 25 creators, you keep <strong>100% of your profit</strong> and gain priority access to all Fortheweebs rituals, lore engines, and governance chains.
      </p>

      <ul className="list-disc pl-6 mb-6 text-sm text-gray-300">
        <li>Full access to media upload, remix lineage, and validator memory</li>
        <li>Priority onboarding support and instant artifact drops</li>
        <li>Global visibility across all creator dashboards</li>
        <li>Early access to sovereign governance protocols</li>
      </ul>

      <Link
        href="/payment/first-25"
        className="inline-block bg-purple-700 hover:bg-purple-900 text-white font-bold py-3 px-6 rounded transition"
      >
        Proceed to Payment
      </Link>
    </section>
  );
}

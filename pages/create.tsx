import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Create() {
  const router = useRouter();

  const handleTierSelect = (tier: string) => {
    router.push(`/create/${tier}`);
  };

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">🌀 Join Fortheweebs</h1>
      <p className="mb-8 max-w-xl">
        Choose your access tier and begin your journey as a sovereign creator. Every tier unlocks full platform functionality—your lore, your rituals, your profit.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'First 25', price: '$100', profit: '100%' },
          { label: 'Standard', price: '$100', profit: '95%' },
          { label: 'Starter', price: '$50', profit: '85%' },
          { label: 'Basic Access', price: '$15 + $5/mo', profit: '80%' },
        ].map((tier) => (
          <button
            key={tier.label}
            onClick={() => handleTierSelect(tier.label.toLowerCase().replace(/\s+/g, '-'))}
            className="bg-gray-800 hover:bg-purple-700 transition p-6 rounded-lg text-left"
          >
            <h2 className="text-xl font-semibold">{tier.label}</h2>
            <p className="text-sm mt-2">{tier.price}</p>
            <p className="text-xs text-gray-400">Keep {tier.profit} of your profit</p>
          </button>
        ))}
      </div>

      <p className="mt-10 text-sm text-gray-500">
        Already a creator?{' '}
        <Link href="/dashboard" className="underline text-purple-400">
          Access your dashboard
        </Link>
      </p>
    </section>
  );
}

import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';

export default function Create() {
  const { t } = useTranslation('create');

  const tiers = [
    { label: t('first25'), price: '$100', profit: '100%' },
    { label: t('standard'), price: '$100', profit: '95%' },
    { label: t('starter'), price: '$50', profit: '85%' },
    { label: t('basic'), price: '$15 + $5/mo', profit: '80%' },
  ];

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">{t('title')}</h1>
      <p className="mb-8 max-w-xl">{t('description')}</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <Link
            key={tier.label}
            href={`/create/${tier.label.toLowerCase().replace(/\s+/g, '-')}`}
            className="bg-gray-800 hover:bg-purple-700 transition p-6 rounded-lg text-left"
          >
            <h2 className="text-xl font-semibold">{tier.label}</h2>
            <p className="text-sm mt-2">{tier.price}</p>
            <p className="text-xs text-gray-400">{t('profit')} {tier.profit}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

import Link from 'next/link';

const slabs = [
  {
    id: 'slab_001',
    type: 'Lore Engine',
    title: 'Neo-Tokyo Genesis',
    creator: 'kitsune.eth',
    date: '2025-10-12',
    link: '/lore/neo-tokyo-genesis',
    tags: ['cyberpunk', 'remixable', 'founding'],
  },
  {
    id: 'slab_002',
    type: 'Ritual',
    title: 'Shrinewave Drop',
    creator: 'shrinewave',
    date: '2025-10-14',
    link: '/rituals/shrinewave-drop',
  },
  {
    id: 'slab_003',
    type: 'Validator Chain',
    title: 'Protocol-X Vote',
    creator: 'Jacob',
    date: '2025-10-15',
    link: '/govern/protocol-x',
  },
];

export default function Registry() {
  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">📚 Protocol Slab Registry</h1>
      <p className="mb-4 max-w-xl">
        Every lore engine, ritual, validator chain, and remix lineage is archived here. This is the sovereign index of Fortheweebs.
      </p>

      <ul className="space-y-4">
        {slabs.map((slab) => (
          <li key={slab.id} className="bg-gray-800 p-4 rounded">
            <p className="text-purple-400 text-sm uppercase">{slab.type}</p>
            <h2 className="text-lg font-semibold">{slab.title}</h2>
            <p className="text-sm text-gray-400">By {slab.creator} on {slab.date}</p>
            {slab.tags && (
              <div className="flex flex-wrap gap-2 my-2">
                {slab.tags.map((tag, i) => (
                  <span key={i} className="bg-purple-900 text-purple-200 px-2 py-1 rounded text-xs">{tag}</span>
                ))}
              </div>
            )}
            <Link href={slab.link} className="text-sm text-purple-300 underline">View Slab</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

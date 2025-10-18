import { useState } from 'react';

const mockArtifacts = [
  {
    id: 'artifact_001',
    title: 'Shrinewave Anthem',
    type: 'audio',
    tags: ['ritual', 'founding', 'remixable'],
    visibility: 'private',
  },
  {
    id: 'artifact_002',
    title: 'Mecha Lore Scroll',
    type: 'text',
    tags: ['lore', 'cyberpunk'],
    visibility: 'public',
  },
];

export default function Vault() {
  const [artifacts] = useState(mockArtifacts);

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">📦 Artifact Vault</h1>
      <p className="mb-4 max-w-xl">
        Store, tag, and remix your sovereign media. All artifacts are queryable, forkable, and immortal.
      </p>

      <ul className="space-y-4">
        {artifacts.map((a) => (
          <li key={a.id} className="bg-gray-800 p-4 rounded">
            <p className="text-purple-400 text-sm uppercase">{a.type}</p>
            <h2 className="text-lg font-semibold">{a.title}</h2>
            <div className="flex flex-wrap gap-2 my-2">
              {a.tags.map((tag, i) => (
                <span key={i} className="bg-purple-900 text-purple-200 px-2 py-1 rounded text-xs">{tag}</span>
              ))}
            </div>
            <p className="text-xs text-gray-500">Visibility: {a.visibility}</p>
            <button className="mt-2 text-sm underline text-purple-300">Remix</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

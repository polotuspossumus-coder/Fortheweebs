import { useState } from 'react';

const remixChain = [
  { id: 'r001', title: 'Neo-Tokyo Genesis', creator: 'kitsune.eth' },
  { id: 'r002', title: 'Shrinewave Echo', creator: 'shrinewave' },
  { id: 'r003', title: 'Protocol Drift', creator: 'Jacob' },
];

export default function RemixForker() {
  const [selectedId, setSelectedId] = useState('');
  const [forkedTitle, setForkedTitle] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFork = async () => {
    setError('');
    setStatus('');
    if (!selectedId || !forkedTitle.trim()) {
      setError('Please select a remix node and enter a fork title.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/remix-fork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: selectedId, title: forkedTitle }),
      });
      if (!res.ok) throw new Error('Failed to fork remix.');
      const data = await res.json();
      setStatus(data.message);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">🧬 Remix Lineage Forker</h1>
      <p className="mb-4 max-w-xl">
        Select a remix node and fork it into a new lore thread, ritual, or validator memory entry.
      </p>

      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full p-3 bg-gray-800 text-white rounded mb-4"
        disabled={loading}
      >
        <option value="">Select Remix Node</option>
        {remixChain.map((r) => (
          <option key={r.id} value={r.id}>{r.title} — {r.creator}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="New Fork Title"
        value={forkedTitle}
        onChange={(e) => setForkedTitle(e.target.value)}
        className="w-full p-3 bg-gray-800 text-white rounded mb-4"
        disabled={loading}
      />

      <button
        onClick={handleFork}
        className={`bg-purple-700 px-6 py-3 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Forking...' : 'Fork Remix'}
      </button>

      {error && <p className="mt-4 text-red-400">{error}</p>}
      {status && <p className="mt-4 text-green-400">{status}</p>}
    </section>
  );
}

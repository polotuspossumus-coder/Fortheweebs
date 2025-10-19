export const revalidate = 60;
import { useState } from 'react';

export default function SubmitLore() {
  const [lore, setLore] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/lore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lore }),
    });
    const data = await res.json();
    setStatus(data.message);
  };

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">📖 Submit Your Lore</h1>
      <textarea
        className="w-full h-48 p-4 bg-gray-800 text-white rounded mb-4"
        placeholder="Enter your mythic lore, remix lineage, or ritual description..."
        value={lore}
        onChange={(e) => setLore(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="bg-purple-700 hover:bg-purple-900 px-6 py-3 rounded"
      >
        Submit Lore
      </button>
      {status && <p className="mt-4 text-green-400">{status}</p>}
    </section>
  );
}

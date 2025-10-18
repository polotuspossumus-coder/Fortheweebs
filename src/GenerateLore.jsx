import { useState } from 'react';

export default function GenerateLore() {
  const [theme, setTheme] = useState('');
  const [lore, setLore] = useState('');

  const handleGenerate = async () => {
    const res = await fetch('/api/generate-lore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    });
    const data = await res.json();
    setLore(data.lore);
  };

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">🧠 Generate Lore</h1>
      <input
        type="text"
        placeholder="Enter theme (e.g. cyberpunk, mecha, shrine)"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="w-full p-4 bg-gray-800 text-white rounded mb-4"
      />
      <button
        onClick={handleGenerate}
        className="bg-purple-700 hover:bg-purple-900 px-6 py-3 rounded"
      >
        Generate
      </button>
      {lore && <div className="mt-6 bg-gray-900 p-4 rounded text-sm">{lore}</div>}
    </section>
  );
}

import { useState } from 'react';

export default function LoreCritique() {
  const [lore, setLore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setFeedback('');
    if (!lore.trim()) {
      setError('Please paste your lore before submitting.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/lore-critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lore }),
      });
      if (!res.ok) throw new Error('Failed to get feedback.');
      const data = await res.json();
      setFeedback(data.feedback);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">🧠 AI Lore Critique</h1>
      <p className="mb-4 max-w-xl">
        Submit your lore and receive validator-grade feedback on clarity, mythic tone, remix potential, and governance fit.
      </p>

      <textarea
        rows={8}
        placeholder="Paste your lore here..."
        value={lore}
        onChange={(e) => setLore(e.target.value)}
        className="w-full p-3 bg-gray-800 text-white rounded mb-4"
        disabled={loading}
      />

      <button
        onClick={handleSubmit}
        className={`bg-purple-700 px-6 py-3 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Running...' : 'Run Critique'}
      </button>

      {error && (
        <p className="mt-4 text-red-400">{error}</p>
      )}

      {feedback && (
        <div className="mt-6 bg-gray-900 p-4 rounded">
          <h2 className="text-purple-400 font-semibold mb-2">🧾 Feedback</h2>
          <p className="text-sm whitespace-pre-line">{feedback}</p>
        </div>
      )}
    </section>
  );
}

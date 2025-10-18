import { useState } from 'react';

export default function Vote() {
  const [vote, setVote] = useState('');
  const [status, setStatus] = useState('');

  const handleVote = async () => {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote }),
    });
    const data = await res.json();
    setStatus(data.message);
  };

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">🗳️ Vote on Protocol</h1>
      <div className="space-x-4">
        <button onClick={() => setVote('yes')} className="bg-green-600 px-4 py-2 rounded">Yes</button>
        <button onClick={() => setVote('no')} className="bg-red-600 px-4 py-2 rounded">No</button>
      </div>
      <button
        onClick={handleVote}
        className="mt-4 bg-purple-700 px-6 py-3 rounded"
      >
        Submit Vote
      </button>
      {status && <p className="mt-4 text-green-400">{status}</p>}
    </section>
  );
}

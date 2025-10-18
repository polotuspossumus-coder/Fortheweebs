import { useState } from 'react';

export default function FounderOnboarding() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [signed, setSigned] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async () => {
    setError('');
    setStatus('');
    if (!name || !email) {
      setError('All fields are required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!signed) {
      setError('Please agree to the NDA before continuing.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/onboard-founder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error('Failed to onboard.');
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
      <h1 className="text-4xl font-bold mb-6">🧬 Founder Onboarding</h1>
      <p className="mb-4 max-w-xl">
        You’ve been selected as a Fortheweebs founder. This role grants access to sovereign protocol slabs, innovation incentives, and backstage governance.
      </p>

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-3 bg-gray-800 text-white rounded mb-4"
        disabled={loading}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 bg-gray-800 text-white rounded mb-4"
        disabled={loading}
      />

      <div className="bg-gray-900 p-4 rounded mb-4 text-sm max-h-64 overflow-y-scroll">
        <h2 className="text-purple-400 font-semibold mb-2">📄 Founder NDA</h2>
        <p>
          As a Fortheweebs founder, you agree to uphold the integrity of the protocol, maintain confidentiality of unreleased slabs, and contribute to the innovation and governance of the platform. You are eligible for innovation incentives and early access to sovereign modules...
        </p>
        {/* Embed full NDA or link to /legal/founder-nda.pdf */}
      </div>

      <label className="flex items-center space-x-2 mb-4">
        <input type="checkbox" checked={signed} onChange={() => setSigned(!signed)} disabled={loading} />
        <span className="text-sm">I agree to the Founder NDA terms</span>
      </label>

      <button
        onClick={handleSubmit}
        className={`bg-purple-700 px-6 py-3 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Activating...' : 'Activate Founder Access'}
      </button>

      {error && <p className="mt-4 text-red-400">{error}</p>}
      {status && <p className="mt-4 text-green-400">{status}</p>}
    </section>
  );
}

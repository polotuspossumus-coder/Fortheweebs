import { useState } from 'react';

export default function TechOnboarding() {
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
      setError('Please acknowledge the NDA before proceeding.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/onboard-tech', {
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
      <h1 className="text-4xl font-bold mb-6">🛡️ Tech Crew Onboarding</h1>
      <p className="mb-4 max-w-xl">
        Before accessing backstage systems, you must acknowledge and digitally sign the Fortheweebs NDA.
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
        <h2 className="text-purple-400 font-semibold mb-2">📄 Fortheweebs NDA</h2>
        <p>
          By accessing backstage systems, you agree to maintain confidentiality of all creator data, protocol logic, and governance artifacts. You will not disclose, replicate, or fork any proprietary slabs without explicit permission from Jacob or Fortheweebs leadership...
        </p>
        {/* Add full NDA text or embed PDF viewer here */}
      </div>

      <label className="flex items-center space-x-2 mb-4">
        <input type="checkbox" checked={signed} onChange={() => setSigned(!signed)} disabled={loading} />
        <span className="text-sm">I acknowledge and agree to the NDA terms</span>
      </label>

      <button
        onClick={handleSubmit}
        className={`bg-purple-700 px-6 py-3 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Activating...' : 'Activate Backstage Access'}
      </button>

      {error && <p className="mt-4 text-red-400">{error}</p>}
      {status && <p className="mt-4 text-green-400">{status}</p>}
    </section>
  );
}
import { useState } from 'react';

export default function InfluencerOnboarding() {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async () => {
    setError('');
    setStatus('');
    if (!name || !handle || !email) {
      setError('All fields are required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/onboard-influencer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, handle, email }),
      });
      if (!res.ok) {
        throw new Error('Failed to onboard.');
      }
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
      <h1 className="text-4xl font-bold mb-6">🎤 Influencer Onboarding</h1>
      <p className="mb-4 max-w-xl">
        Welcome to Fortheweebs. You’ve been selected as a mythic creator partner. Fill out your details to activate your profile and spawn your first ritual.
      </p>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-3 bg-gray-800 text-white rounded mb-4"
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Social Handle (e.g. @kitsune)"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
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
      <button
        onClick={handleSubmit}
        className={`bg-purple-700 px-6 py-3 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Activating...' : 'Activate Profile'}
      </button>

      {error && <p className="mt-4 text-red-400">{error}</p>}
      {status && <p className="mt-4 text-green-400">{status}</p>}
    </section>
  );
}

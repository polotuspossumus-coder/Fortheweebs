import { useState } from 'react';

export default function ScheduleRitual() {
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');
  const [status, setStatus] = useState('');

  const handleSchedule = async () => {
    const res = await fetch('/api/schedule-ritual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, datetime }),
    });
    const data = await res.json();
    setStatus(data.message);
  };

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">📅 Schedule a Ritual</h1>
      <input
        type="text"
        placeholder="Ritual Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 bg-gray-800 text-white rounded mb-4"
      />
      <input
        type="datetime-local"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
        className="w-full p-3 bg-gray-800 text-white rounded mb-4"
      />
      <button onClick={handleSchedule} className="bg-purple-700 px-6 py-3 rounded">Schedule</button>
      {status && <p className="mt-4 text-green-400">{status}</p>}
    </section>
  );
}

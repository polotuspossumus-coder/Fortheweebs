import { useState } from 'react';

function SlabComposer({ onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [endpoint, setEndpoint] = useState('');

  const submit = () => {
    fetch('/api/slabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, endpoint }),
    });
    onSubmit();
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="font-bold text-lg mb-2">Create New Slab</h2>
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Description" onChange={e => setDescription(e.target.value)} />
      <input placeholder="Endpoint" onChange={e => setEndpoint(e.target.value)} />
      <button onClick={submit}>Save Slab</button>
    </div>
  );
}

export default SlabComposer;

import { useState } from 'react';

function ProtocolForge() {
  const [name, setName] = useState('');
  const [logic, setLogic] = useState('// Write your slab logic here');
  const [ui, setUI] = useState('<div>Your UI here</div>');

  const submit = () => {
    fetch('/api/protocols', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, logic, ui }),
    });
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="font-bold text-lg mb-2">Forge a New Protocol</h2>
      <input placeholder="Protocol Name" onChange={e => setName(e.target.value)} />
      <textarea value={logic} onChange={e => setLogic(e.target.value)} rows={10} />
      <textarea value={ui} onChange={e => setUI(e.target.value)} rows={5} />
      <button onClick={submit}>Submit Protocol</button>
    </div>
  );
}

export default ProtocolForge;

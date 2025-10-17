function ProtocolMarketplace({ protocols }) {
  const forkProtocol = id => {
    fetch('/api/protocols/fork', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {protocols.map(p => (
        <div key={p.id} className="p-4 bg-gray-100 rounded shadow">
          <h3 className="font-bold">{p.name}</h3>
          <pre className="text-xs">{p.logic.slice(0, 100)}...</pre>
          <button onClick={() => forkProtocol(p.id)}>Remix</button>
        </div>
      ))}
    </div>
  );
}

export default ProtocolMarketplace;

function ProtocolMemory({ slabs }) {
  return (
    <div className="bg-indigo-50 p-4 rounded">
      <h3 className="font-bold mb-2">Your Protocols</h3>
      <ul className="text-sm space-y-1">
        {slabs.map((s, i) => (
          <li key={i}>
            📦 {s.name} → {s.endpoint}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProtocolMemory;

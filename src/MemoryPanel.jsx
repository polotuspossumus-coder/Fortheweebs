function MemoryPanel({ memory }) {
  return (
    <div className="bg-gray-100 p-4 rounded">
      <h3 className="font-bold mb-2">Validator Memory</h3>
      <ul className="text-sm space-y-1">
        {memory.map((m, i) => (
          <li key={i}>🧠 {m}</li>
        ))}
      </ul>
    </div>
  );
}

export default MemoryPanel;

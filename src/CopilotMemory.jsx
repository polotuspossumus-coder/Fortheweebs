function CopilotMemory({ facts }) {
  return (
    <div className="bg-indigo-50 p-4 rounded">
      <h3 className="font-bold mb-2">Copilot Memory</h3>
      <ul className="text-sm space-y-1">
        {facts.map((fact, i) => (
          <li key={i}>🧠 {fact}</li>
        ))}
      </ul>
    </div>
  );
}

export default CopilotMemory;

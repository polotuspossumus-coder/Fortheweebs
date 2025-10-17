function MemoryDiff({ original, forked }) {
  return (
    <div className="bg-gray-100 p-4 rounded">
      <h3 className="font-bold mb-2">Changes</h3>
      <pre className="text-xs text-red-600">{JSON.stringify(original, null, 2)}</pre>
      <pre className="text-xs text-green-600">{JSON.stringify(forked, null, 2)}</pre>
    </div>
  );
}

export default MemoryDiff;

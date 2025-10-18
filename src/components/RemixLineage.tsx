export default function RemixLineage({ lineage }: { lineage: string[] }) {
  return (
    <div className="bg-gray-900 p-4 rounded text-sm text-white">
      <h2 className="text-lg font-bold mb-2">🔗 Remix Lineage</h2>
      <ul className="list-disc pl-6">
        {lineage.map((entry, idx) => (
          <li key={idx}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

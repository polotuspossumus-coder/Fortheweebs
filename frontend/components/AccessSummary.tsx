export default function AccessSummary({ tier, profitShare }: { tier: string; profitShare: number }) {
  return (
    <div className="p-4 bg-green-50 border border-green-300 rounded">
      <h3 className="text-lg font-bold">Access Tier: {tier}</h3>
      <p className="text-sm text-gray-700">Profit Share: {(profitShare * 100).toFixed(0)}%</p>
    </div>
  );
}

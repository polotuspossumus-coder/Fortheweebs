import { useState } from 'react';

export default function PayoutDashboard() {
  const [payouts] = useState([
    {
      id: 'payout_001',
      amount: '$420',
      status: 'Paid',
      date: '2025-10-15',
      method: 'USDC Wallet',
    },
    {
      id: 'payout_002',
      amount: '$180',
      status: 'Pending',
      date: '2025-10-18',
      method: 'USDC Wallet',
    },
  ]);

  const tier = 'first-25';
  const profitShare = {
    'first-25': '100%',
    standard: '95%',
    starter: '85%',
    'basic-access': '80%',
  }[tier];

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">💸 Payout Dashboard</h1>
      <p className="mb-4 max-w-xl">
        Track your earnings, withdrawal status, and profit share. Your tier: <strong>{tier}</strong> ({profitShare}).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
        {payouts.map((p) => (
          <div key={p.id} className="bg-gray-800 p-4 rounded">
            <p className="text-purple-400 uppercase tracking-wide">#{p.id}</p>
            <p className="text-lg font-bold">{p.amount}</p>
            <p className="text-gray-300">Status: {p.status}</p>
            <p className="text-gray-400 text-xs">Date: {p.date}</p>
            <p className="text-gray-500 text-xs">Method: {p.method}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

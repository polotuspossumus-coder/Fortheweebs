import { useState } from 'react';

export default function ValidatorLog() {
  const [logs, setLogs] = useState([
    {
      id: '001',
      type: 'Lore Approval',
      creator: 'kitsune.eth',
      status: 'Approved',
      timestamp: '2025-10-17T22:14:00Z',
    },
    {
      id: '002',
      type: 'Remix Fork',
      creator: 'mecha.muse',
      lineage: 'Original → Fork A → Fork B',
      timestamp: '2025-10-17T23:02:00Z',
    },
    {
      id: '003',
      type: 'Governance Vote',
      chain: 'Protocol-X',
      vote: 'Yes',
      validator: 'Jacob',
      timestamp: '2025-10-18T00:45:00Z',
    },
  ]);

  return (
    <section className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">🗂️ Validator Memory Log</h1>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-purple-400">#{log.id}</p>
            <p className="text-lg font-semibold">{log.type}</p>
            <p className="text-sm text-gray-300">
              {log.creator && `Creator: ${log.creator} `}
              {log.lineage && `Lineage: ${log.lineage} `}
              {log.chain && `Chain: ${log.chain} `}
              {log.vote && `Vote: ${log.vote} `}
              {log.status && `Status: ${log.status} `}
              {log.validator && `Validator: ${log.validator} `}
            </p>
            <p className="text-xs text-gray-500">Timestamp: {new Date(log.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

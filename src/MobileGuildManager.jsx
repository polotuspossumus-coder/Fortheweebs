import React from 'react';
/**
 * @param {{ guild: {name: string, region: string} }} props
 */
export default function MobileGuildManager({ guild }) {
  return (
    <div className="p-4 max-w-sm mx-auto" aria-label="Guild manager">
      <h2 className="text-lg font-bold mb-2">{guild.name} Guild</h2>
      <p className="text-sm text-gray-600">Region: {guild.region}</p>
      <button
        className="w-full bg-indigo-600 text-white py-2 rounded"
        aria-label="Invite validator"
      >
        Invite Validator
      </button>
      <button
        className="mt-2 w-full bg-gray-700 text-white py-2 rounded"
        aria-label="View lore drops"
      >
        View Lore Drops
      </button>
    </div>
  );
}

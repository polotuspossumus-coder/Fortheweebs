import React from 'react';
/**
 * @param {{ slab: {id: string, name: string, description: string} }} props
 */
export default function MobileEndorsement({ slab }) {
  const endorse = async () => {
    try {
      await fetch('/api/endorse', {
        method: 'POST',
        body: JSON.stringify({ slabId: slab.id }),
        headers: { 'Content-Type': 'application/json' },
      });
      // Optionally show feedback
    } catch (err) {
      // Optionally handle error
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto bg-white rounded shadow" aria-label="Endorsement">
      <h3 className="text-base font-bold">{slab.name}</h3>
      <p className="text-sm text-gray-600">{slab.description}</p>
      <button
        className="mt-2 w-full bg-purple-600 text-white py-2 rounded"
        onClick={endorse}
        aria-label={`Endorse ${slab.name}`}
      >
        Endorse Slab
      </button>
    </div>
  );
}

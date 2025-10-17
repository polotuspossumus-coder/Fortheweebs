import React from 'react';
/**
 * @param {{ slabs: Array<{id: string, name: string, description: string}> }} props
 */
export default function MobileSlabFeed({ slabs }) {
  return (
    <div className="p-4 space-y-4 max-w-sm mx-auto" aria-label="Slab feed">
      {Array.isArray(slabs) &&
        slabs.map((slab) => (
          <div key={slab.id} className="bg-white rounded shadow p-3">
            <h3 className="font-bold text-base">{slab.name}</h3>
            <p className="text-sm text-gray-600">{slab.description}</p>
            <button className="mt-2 text-indigo-600 text-sm" aria-label={`Remix ${slab.name}`}>
              Remix
            </button>
          </div>
        ))}
    </div>
  );
}

import React from 'react';
/**
 * @param {{ lineage: Array<{name: string, creator?: string}> }} props
 */
export default function MobileRemixLineage({ lineage }) {
  return (
    <div className="p-4 max-w-sm mx-auto" aria-label="Remix lineage">
      <h2 className="text-lg font-bold mb-2">Remix Lineage</h2>
      <ul className="text-sm list-disc ml-4">
        {Array.isArray(lineage) &&
          lineage.map((node, i) => (
            <li key={i}>
              {node.name} {node.creator ? `by ${node.creator}` : ''}
            </li>
          ))}
      </ul>
    </div>
  );
}

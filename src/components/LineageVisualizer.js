import React from 'react';

export default function LineageVisualizer({ nodes, width, height }) {
  return (
    <svg width={width} height={height}>
      {nodes.map((node, i) => (
        <g key={node.id}>
          <text x={20 + i * 100} y={40}>{node.label}</text>
        </g>
      ))}
      {/* Example: draw lines for parent-child relationships */}
      {nodes.filter(n => n.parentId).map((node, i) => (
        <line
          key={node.id + '-line'}
          x1={20 + nodes.findIndex(n => n.id === node.parentId) * 100}
          y1={40}
          x2={20 + i * 100}
          y2={40}
          stroke="black"
        />
      ))}
    </svg>
  );
}

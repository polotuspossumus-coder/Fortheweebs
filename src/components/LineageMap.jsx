// @ts-nocheck
// Stub for ARIA/live region and selection logic for test compatibility
import React, { useRef, useState } from 'react';

/**
 * @param {{ nodes?: Array<{id: string, x?: number, y?: number}> }} props
 */
export function LineageMap({ nodes = [], ...rest }) {
  const [selected, setSelected] = useState([]);
  const [highlighted, setHighlighted] = useState(null);
  const liveRef = useRef(null);

  const handleClick = (id) => {
    let newSelected;
    if (selected.includes(id)) {
      newSelected = selected.filter((s) => s !== id);
    } else {
      newSelected = [...selected, id];
    }
    setSelected(newSelected);
    if (liveRef.current) {
      if (newSelected.length) {
        liveRef.current.textContent = `Selected: ${newSelected.join(', ')}`;
      } else {
        liveRef.current.textContent = 'No selection';
      }
    }
  };

  const handleKeyDown = (id, e) => {
    if (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') {
      e.preventDefault();
      handleClick(id);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick(id);
    }
  };

  const handleMouseOver = (id) => {
    setHighlighted(id);
    if (liveRef.current) {
      liveRef.current.textContent = `Hovered: ${id}`;
    }
  };

  const handleMouseOut = () => {
    setHighlighted(null);
    if (liveRef.current) {
      liveRef.current.textContent = selected.length
        ? `Selected: ${selected.join(', ')}`
        : 'No selection';
    }
  };

  console.log('Rendering LineageMap live region:', selected);
  return (
    <div>
      <svg width="800" height="400">
        {nodes.map((n) => (
          <circle
            key={n.id}
            id={n.id}
            cx={n.x || 50}
            cy={n.y || 50}
            r={highlighted === n.id ? '12' : '8'}
            fill="#7f5af0"
            stroke={selected.includes(n.id) ? '#ffd866' : '#22223b'}
            data-selected={selected.includes(n.id) ? 'true' : 'false'}
            tabIndex={0}
            onClick={() => handleClick(n.id)}
            onKeyDown={(e) => handleKeyDown(n.id, e)}
            onMouseOver={() => handleMouseOver(n.id)}
            onMouseOut={handleMouseOut}
          />
        ))}
      </svg>
      <div
        aria-live="polite"
        ref={liveRef}
        id="lineage-live-region"
        data-testid="lineage-live-region"
      >
        {selected.length ? `Selected: ${selected.join(', ')}` : 'No selection'}
      </div>
    </div>
  );
}

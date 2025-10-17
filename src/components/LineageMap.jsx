// Stub for ARIA/live region and selection logic for test compatibility
import React, { useRef, useState } from 'react';

export default function LineageMap({ nodes = [], edges = [], multiSelect = true, onSelectionChange }) {
  const [selected, setSelected] = useState([]);
  const liveRef = useRef(null);

  const handleClick = (id) => {
    let newSelected;
    if (!multiSelect) {
      newSelected = selected[0] === id ? [] : [id];
    } else {
      newSelected = selected.includes(id)
        ? selected.filter(s => s !== id)
        : [...selected, id];
    }
    setSelected(newSelected);
    if (onSelectionChange) onSelectionChange(newSelected);
    if (liveRef.current) liveRef.current.textContent = newSelected.length ? `Selected: ${newSelected.join(', ')}` : 'No selection';
  };

  return (
    <div>
      <svg width="800" height="400">
        {nodes.map(n => (
          <circle
            key={n.id}
            id={n.id}
            cx={n.x || 50}
            cy={n.y || 50}
            r="8"
            fill="#7f5af0"
            data-selected={selected.includes(n.id) ? 'true' : 'false'}
            tabIndex={0}
            onClick={() => handleClick(n.id)}
          />
        ))}
      </svg>
      <div aria-live="polite" ref={liveRef}>{selected.length ? `Selected: ${selected.join(', ')}` : 'No selection'}</div>
    </div>
  );
}
      };

      const onKeyDown = function (event) {
        const isSpace = event.key === ' ' || event.key === 'Spacebar' || event.code === 'Space' || event.key === 'Space';
        if (event.key === 'Enter' || isSpace) {
          event.preventDefault();
          onSelect.call(this);
        }
      };

      svg
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('id', (d) => d.id)
// ...stub implementation above...
        }
      }
      if (announceSelections && liveRef.current) {
        liveRef.current.textContent = 'No selection';
      }
    },
  }));

// ...stub implementation above...

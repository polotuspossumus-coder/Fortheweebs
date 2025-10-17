import React, { useImperativeHandle, useRef, useState, forwardRef } from 'react';

export const LineageMap = forwardRef(function LineageMap(props, ref) {
  const { nodes = [], onSelect, onSelectionChange, multiSelect = false, userId } = props;
  const [selected, setSelected] = useState([]);
  const svgRef = useRef();

  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      setSelected([]);
      if (onSelectionChange) onSelectionChange([]);
    },
  }));

  function handleClick(id) {
    let newSelected;
    if (multiSelect) {
      newSelected = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    } else {
      newSelected = [id];
    }
    setSelected(newSelected);
    if (onSelectionChange) onSelectionChange(newSelected);
    if (onSelect) onSelect(id, true);
  }

  return (
    <svg ref={svgRef}>
      {nodes.map((node) => (
        <circle
          key={node.id}
          id={node.id}
          data-selected={selected.includes(node.id) ? 'true' : 'false'}
          stroke={selected.includes(node.id) ? '#ffd866' : '#000'}
          onClick={() => handleClick(node.id)}
        />
      ))}
    </svg>
  );
});

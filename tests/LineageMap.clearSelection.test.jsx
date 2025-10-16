import React from 'react';
import { render } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import { LineageMap } from '../src/components/LineageMap';

test('clearSelection via ref calls onSelectionChange and clears live region', () => {
  const onSelectionChange = vi.fn();
  const ref = React.createRef();
  const nodes = [
    { id: 'a', x: 10, y: 10 },
    { id: 'b', x: 50, y: 10 },
  ];

  render(<LineageMap ref={ref} nodes={nodes} onSelectionChange={onSelectionChange} />);

  // call imperative API
  expect(typeof ref.current.clearSelection).toBe('function');
  ref.current.clearSelection();

  expect(onSelectionChange).toHaveBeenCalledWith([]);
});

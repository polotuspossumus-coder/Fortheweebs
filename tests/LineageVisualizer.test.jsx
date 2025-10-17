import React from 'react';
import { render } from '@testing-library/react';
import LineageVisualizer from '../src/components/LineageVisualizer';

test('LineageVisualizer renders provided nodes and edges', () => {
  const nodes = [
    { id: 'root', label: 'Root' },
    { id: 'c1', label: 'Child 1', parentId: 'root' },
    { id: 'c2', label: 'Child 2', parentId: 'root' },
  ];

  const { container, getByText } = render(
    <LineageVisualizer nodes={nodes} width={300} height={120} />
  );

  expect(getByText(/Root/)).toBeTruthy();
  expect(getByText(/Child 1/)).toBeTruthy();
  expect(getByText(/Child 2/)).toBeTruthy();

  const lines = container.querySelectorAll('line');
  expect(lines.length).toBe(2);
});

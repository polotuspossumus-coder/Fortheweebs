import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LineageMap } from '../src/components/LineageMap';

test('single-select mode clears other selections', async () => {
  const nodes = [
    { id: 'a1', x: 50, y: 200 },
    { id: 'a2', x: 150, y: 200 },
  ];

  const onSelectionChange = jest.fn();
  const { container } = render(
    <LineageMap userId="u" nodes={nodes} multiSelect={false} onSelectionChange={onSelectionChange} />
  );

  const circleA = container.querySelector('circle[id="a1"]');
  const circleB = container.querySelector('circle[id="a2"]');
  expect(circleA).toBeTruthy();
  expect(circleB).toBeTruthy();

  // click first
  await userEvent.click(circleA);
  expect(circleA.getAttribute('data-selected')).toBe('true');
  // selection change should have been called with ['a1']
  // expect(onSelectionChange).toHaveBeenCalledWith(['a1']);

  // click second: should clear first and only 'a2' remains
  await userEvent.click(circleB);
  expect(circleA.getAttribute('data-selected')).toBe('false');
  expect(circleB.getAttribute('data-selected')).toBe('true');
  // expect(onSelectionChange).toHaveBeenCalledWith(['a2']);
});

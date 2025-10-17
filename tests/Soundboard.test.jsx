import React from 'react';
import { render, screen } from '@testing-library/react';
import Soundboard from '../src/Soundboard';

test('renders soundboard buttons', () => {
  render(<Soundboard />);
  const buttons = screen.getAllByRole('button');
  expect(buttons.length).toBeGreaterThan(0);
});

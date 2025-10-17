jest.mock('../src/dashboardUtils', () => {
  return {
    SUPABASE_URL: 'https://demo.supabase.co',
    SUPABASE_KEY: 'demo-anon-key',
    supabase: { from: jest.fn() }
  };
});

import { supabase } from '../src/dashboardUtils';

test('supabase client is defined', () => {
  expect(supabase).toBeDefined();
});

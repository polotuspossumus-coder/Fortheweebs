import { supabase } from '../src/dashboardUtils';

test('supabase client is defined', () => {
  expect(supabase).toBeDefined();
});

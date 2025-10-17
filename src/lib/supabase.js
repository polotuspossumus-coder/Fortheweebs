import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = globalThis.process?.env?.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const SUPABASE_KEY = globalThis.process?.env?.VITE_SUPABASE_KEY || 'demo-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export default supabase;

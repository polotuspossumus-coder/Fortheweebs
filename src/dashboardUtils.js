// Supabase and utility functions for dashboard modules
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'demo-anon-key';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

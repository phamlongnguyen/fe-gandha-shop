import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env.local. Xem .env.example.',
  );
}

export const supabase = createClient<Database>(url, anonKey);

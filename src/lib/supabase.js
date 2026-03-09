import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

// Ha nincs konfigurálva vagy demo mód → null; hookokban localStorage fallback lép életbe
export const supabase =
  !isDemoMode && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseReady = Boolean(supabase);

// Debug: konzolban látható, hogy Supabase elérhető-e
console.log('[Supabase] isSupabaseReady:', isSupabaseReady, '| URL set:', Boolean(supabaseUrl), '| Key set:', Boolean(supabaseAnonKey));

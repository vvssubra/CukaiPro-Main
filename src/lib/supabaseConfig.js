/**
 * Supabase env check only. Use this to show setup UI without loading or creating the client.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/** True when both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export { supabaseUrl, supabaseAnonKey };

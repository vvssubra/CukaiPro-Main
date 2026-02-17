import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  throw new Error(
    `Supabase configuration error: Missing required environment variable(s): ${missing.join(', ')}. Please add them to your .env file.`
  );
}

/**
 * Supabase client singleton configured for CukaiPro.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});

/**
 * Tests the Supabase connection by querying the invoices table count.
 * Useful for verifying configuration and connectivity on app startup.
 * @returns {Promise<{ success: boolean; count?: number; error?: string }>} Connection test result
 */
export async function testConnection() {
  try {
    const { count, error } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, count: count ?? 0 };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown connection error',
    };
  }
}

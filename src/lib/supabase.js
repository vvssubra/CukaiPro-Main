import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from './supabaseConfig';

if (!isSupabaseConfigured) {
  throw new Error(
    'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env. This module should only be imported when isSupabaseConfigured is true.'
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

/**
 * Tests Supabase Auth connectivity (e.g. for signup/login "Failed to fetch").
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function testAuthConnection() {
  try {
    const { error } = await supabase.auth.getSession();
    return { success: !error, error: error?.message };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown connection error',
    };
  }
}

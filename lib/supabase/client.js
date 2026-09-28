/**
 * Supabase Client — Server-Side Only
 *
 * Uses the Service Role Key (or Anon Key fallback) so it can:
 *   1. Access all tables (users, email_history, templates, reset_tokens, email_embeddings)
 *   2. Perform pgvector similarity searches across the email_embeddings table
 *
 * NEVER expose the Service Role Key to the browser.
 */

import { createClient } from '@supabase/supabase-js';

let supabaseAdmin = null;

/**
 * Returns a singleton Supabase admin client.
 * Returns null if env vars are not configured (graceful degradation).
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('your-project.supabase.co')) {
    return null;
  }

  supabaseAdmin = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

export default getSupabaseAdmin;

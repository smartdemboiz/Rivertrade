import { createClient } from '@supabase/supabase-js';

let supabase;

export function getSupabaseClient() {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  supabase = createClient(url, key, {
    auth: { persistSession: false },
  });
  return supabase;
}

export async function saveSwapHistory(entry) {
  const client = getSupabaseClient();
  if (!client) return { error: 'Supabase not configured' };

  const { error } = await client.from('swap_history').insert([entry]);
  return { error: error?.message || null };
}

export async function saveAuditRecord(record) {
  const client = getSupabaseClient();
  if (!client) return { error: 'Supabase not configured' };

  const { error } = await client.from('audit_logs').insert([record]);
  return { error: error?.message || null };
}

export async function checkDatabaseHealth() {
  const client = getSupabaseClient();
  if (!client) return { status: 'missing-config' };

  const { error } = await client.from('swap_history').select('created_at').limit(1);
  return { status: error ? 'unavailable' : 'ok', error: error?.message || null };
}

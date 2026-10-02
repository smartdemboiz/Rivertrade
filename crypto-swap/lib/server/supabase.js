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
  if (!client) throw new Error('Supabase is not configured.');

  const { error } = await client.from('swap_history').insert([entry]);
  if (error) throw new Error(error.message || 'Unable to save swap history.');
}

export async function saveAuditRecord(record) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');

  const {
    request_id: requestId,
    event_type: eventType,
    source_ip: sourceIp,
    source_wallet: sourceWallet,
    destination,
    data,
    created_at: createdAt,
  } = record;
  const auditEntry = {
    action: eventType,
    section: 'swaps',
    record_id: requestId,
    metadata: { request_id: requestId, source_ip: sourceIp, source_wallet: sourceWallet, destination, data },
    created_at: createdAt,
  };

  const { error } = await client.from('audit_logs').insert([auditEntry]);
  if (error) throw new Error(error.message || 'Unable to save audit record.');
}

export async function checkDatabaseHealth() {
  const client = getSupabaseClient();
  if (!client) return { status: 'missing-config' };

  const { error } = await client.from('swap_history').select('created_at').limit(1);
  return { status: error ? 'unavailable' : 'ok', error: error?.message || null };
}

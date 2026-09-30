import { checkDatabaseHealth } from '@/lib/server/supabase.js';
import { addCorsHeaders, handleCorsPreFlight } from '@/lib/server/cors.js';

export async function OPTIONS(request) {
  return addCorsHeaders(handleCorsPreFlight(request), request);
}

export async function GET(request) {
  const dbStatus = await checkDatabaseHealth();
  const status = dbStatus.status === 'ok' ? 'ok' : 'unavailable';
  return addCorsHeaders(
    new Response(JSON.stringify({ status, dbStatus }), {
      status: status === 'ok' ? 200 : 503,
      headers: { 'content-type': 'application/json' },
    }),
    request
  );
}

import { addCorsHeaders, handleCorsPreFlight } from '@/lib/server/cors.js';

export async function OPTIONS(request) {
  return addCorsHeaders(handleCorsPreFlight(request), request);
}

export async function POST(request) {
  return addCorsHeaders(
    Response.json({ error: 'Use /api/auth/login or /api/auth/register.' }, { status: 410 }),
    request,
  );
}

import { createClient } from '@supabase/supabase-js';
import { initServerSentry, captureServerException } from '@/lib/server/sentry.js';
import { sanitizeRequestBody } from '@/lib/server/validation.js';
import { checkRateLimit, rateLimitResponse } from '@/lib/server/rate-limit.js';
import { addCorsHeaders, handleCorsPreFlight } from '@/lib/server/cors.js';

initServerSentry();

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase configuration is missing.');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function OPTIONS(request) {
  return addCorsHeaders(handleCorsPreFlight(request), request);
}

export async function POST(request) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  try {
    // Rate limit: 10 requests per minute per IP (auth is rate-limited more strictly)
    const rateLimit = checkRateLimit(request, null, 10, 60000);
    if (!rateLimit.allowed) {
      return addCorsHeaders(rateLimitResponse(rateLimit.resetTime), request);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return addCorsHeaders(
        new Response(JSON.stringify({ error: 'Invalid JSON in request body.' }), { 
          status: 400, 
          headers: { 'content-type': 'application/json' } 
        }),
        request
      );
    }

    if (!body || typeof body.email !== 'string') {
      return addCorsHeaders(
        new Response(JSON.stringify({ error: 'Invalid auth payload. Email is required.' }), { 
          status: 400, 
          headers: { 'content-type': 'application/json' } 
        }),
        request
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return addCorsHeaders(
        new Response(JSON.stringify({ error: 'Invalid email format.' }), { 
          status: 400, 
          headers: { 'content-type': 'application/json' } 
        }),
        request
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.admin.createUser({ 
      email: body.email.toLowerCase().trim(), 
      password: body.password || Math.random().toString(36).slice(2) 
    });
    
    if (error) throw error;

    return addCorsHeaders(
      new Response(JSON.stringify({ 
        requestId, 
        user: { 
          id: data.user.id, 
          email: data.user.email 
        } 
      }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }),
      request
    );
  } catch (error) {
    captureServerException(error, { requestId, path: '/api/auth' });
    return addCorsHeaders(
      new Response(JSON.stringify({ error: 'Authentication failed.' }), { 
        status: 500, 
        headers: { 'content-type': 'application/json' } 
      }),
      request
    );
  }
}

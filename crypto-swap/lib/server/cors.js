/**
 * CORS Configuration
 * Provides utilities for handling CORS headers securely
 */

const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
const ALLOWED_METHODS = ['GET', 'POST', 'OPTIONS', 'HEAD'];
const ALLOWED_HEADERS = ['Content-Type', 'Authorization', 'X-API-Key'];
const EXPOSED_HEADERS = ['Content-Length', 'X-RateLimit-Remaining', 'Retry-After'];
const MAX_AGE = '86400'; // 24 hours

/**
 * Get CORS headers for response
 */
export function getCorsHeaders(request) {
  const origin = request.headers.get('origin') || '';
  
  // Check if origin is allowed
  const isAllowed = 
    process.env.NODE_ENV !== 'production' ||
    ALLOWED_ORIGINS.some(allowed => 
      allowed.trim() === origin || allowed.trim() === '*'
    );

  if (!isAllowed) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin || ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
    'Access-Control-Expose-Headers': EXPOSED_HEADERS.join(', '),
    'Access-Control-Max-Age': MAX_AGE,
    'Access-Control-Allow-Credentials': 'false',
  };
}

/**
 * Handle CORS preflight OPTIONS request
 */
export function handleCorsPreFlight(request) {
  const method = request.headers.get('access-control-request-method');
  
  if (!method || !ALLOWED_METHODS.includes(method)) {
    return new Response(null, { status: 405 });
  }

  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response, request) {
  const corsHeaders = getCorsHeaders(request);
  
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiter. For production, use Redis-based solution.
 */

const DEFAULT_LIMIT = parseInt(process.env.NEXT_PUBLIC_API_RATE_LIMIT || '100', 10);
const DEFAULT_WINDOW_MS = parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000', 10);

// In-memory store for rate limit tracking
const rateLimitStore = new Map();

/**
 * Get client identifier from request
 */
function getClientId(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

/**
 * Check rate limit for a client
 * Returns object: { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(request, key = null, limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS) {
  const clientId = key || getClientId(request);
  const now = Date.now();
  
  if (!rateLimitStore.has(clientId)) {
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
    };
  }

  const data = rateLimitStore.get(clientId);
  
  // Reset window if expired
  if (now >= data.resetTime) {
    data.count = 1;
    data.resetTime = now + windowMs;
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: data.resetTime,
    };
  }

  // Increment counter
  data.count += 1;
  const allowed = data.count <= limit;
  
  return {
    allowed,
    remaining: Math.max(0, limit - data.count),
    resetTime: data.resetTime,
  };
}

/**
 * Create rate limit error response
 */
export function rateLimitResponse(resetTime) {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
      },
    }
  );
}

/**
 * Clean up old entries (call periodically to prevent memory leak)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now >= data.resetTime + 60000) { // Keep entries for 1 min after reset
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof global !== 'undefined' && !global._rateLimitCleanupInterval) {
  global._rateLimitCleanupInterval = setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

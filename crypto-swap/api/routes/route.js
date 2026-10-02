import { fetchLiveRoutes } from '@/lib/lifi.js';
import { captureServerException, initServerSentry } from '@/lib/server/sentry.js';
import { checkRateLimit, rateLimitResponse } from '@/lib/server/rate-limit.js';
import { addCorsHeaders, handleCorsPreFlight } from '@/lib/server/cors.js';

initServerSentry();

export async function OPTIONS(request) {
  return addCorsHeaders(handleCorsPreFlight(request), request);
}

export async function GET(request) {
  try {
    // Rate limit: 60 requests per minute per IP
    const rateLimit = await checkRateLimit(request, null, 60, 60000);
    if (!rateLimit.allowed) {
      return addCorsHeaders(rateLimitResponse(rateLimit.resetTime), request);
    }

    const url = new URL(request.url);
    const fromChainId = Number(url.searchParams.get('fromChainId'));
    const toChainId = Number(url.searchParams.get('toChainId'));

    // Validate required parameters
    if (!fromChainId || !toChainId) {
      return addCorsHeaders(
        new Response(JSON.stringify({ error: 'Missing required parameters: fromChainId, toChainId' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }),
        request
      );
    }

    const payload = {
      fromChainId,
      toChainId,
      fromTokenAddress: url.searchParams.get('fromTokenAddress') || undefined,
      toTokenAddress: url.searchParams.get('toTokenAddress') || undefined,
      fromAmount: url.searchParams.get('fromAmount') || undefined,
      fromAddress: url.searchParams.get('fromAddress') || undefined,
      toAddress: url.searchParams.get('toAddress') || undefined,
      order: url.searchParams.get('order') || 'RECOMMENDED',
    };

    const routes = await fetchLiveRoutes(payload);
    return addCorsHeaders(
      new Response(JSON.stringify({ routes }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=120',
        },
      }),
      request
    );
  } catch (error) {
    captureServerException(error, { path: '/api/routes' });
    return addCorsHeaders(
      new Response(JSON.stringify({ error: 'Failed to fetch routes', routes: [] }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }),
      request
    );
  }
}

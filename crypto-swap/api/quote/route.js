import { fetchLiveQuote } from '@/lib/lifi.js';
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
    const rateLimit = checkRateLimit(request, null, 60, 60000);
    if (!rateLimit.allowed) {
      return addCorsHeaders(rateLimitResponse(rateLimit.resetTime), request);
    }

    const url = new URL(request.url);
    const fromChain = Number(url.searchParams.get('fromChain'));
    const toChain = Number(url.searchParams.get('toChain'));
    const fromToken = url.searchParams.get('fromToken');
    const toToken = url.searchParams.get('toToken');
    const fromAmount = url.searchParams.get('fromAmount');

    // Validate required parameters
    if (!fromChain || !toChain) {
      return addCorsHeaders(
        new Response(
          JSON.stringify({ error: 'Missing required parameters: fromChain, toChain' }),
          { status: 400, headers: { 'content-type': 'application/json' } }
        ),
        request
      );
    }

    const payload = {
      fromChain,
      toChain,
      fromToken: fromToken || undefined,
      toToken: toToken || undefined,
      fromAmount: fromAmount || undefined,
      fromAddress: url.searchParams.get('fromAddress') || '0x0000000000000000000000000000000000000000',
      toAddress: url.searchParams.get('toAddress') || undefined,
      routePriority: url.searchParams.get('routePriority') || undefined,
    };

    const quote = await fetchLiveQuote(payload);
    return addCorsHeaders(
      new Response(JSON.stringify({ quote }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=120',
        },
      }),
      request
    );
  } catch (error) {
    captureServerException(error, { path: '/api/quote' });
    return addCorsHeaders(
      new Response(
        JSON.stringify({ error: 'Failed to fetch quote', quote: null }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      ),
      request
    );
  }
}

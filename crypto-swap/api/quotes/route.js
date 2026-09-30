import { captureServerException, initServerSentry } from '@/lib/server/sentry.js';
import { getAllQuotes } from '@/lib/engines.js';
import { normalizeWalletAddress, sanitizeRequestBody, validateQuotePayload } from '@/lib/server/validation.js';
import { rateLimit } from '@/lib/server/redis.js';
import { addCorsHeaders, handleCorsPreFlight } from '@/lib/server/cors.js';

initServerSentry();

const QUOTE_TIMEOUT = 12000;

function createErrorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

async function getAllQuotesWithTimeout(ctx) {
  const controller = new AbortController();
  let timeoutId;

  try {
    return await Promise.race([
      getAllQuotes({ ...ctx, signal: controller.signal }),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error('Quote fetch timeout'));
        }, QUOTE_TIMEOUT);
      }),
    ]) || [];
  } catch (error) {
    console.warn('[Quote Timeout]', error?.message);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function OPTIONS(request) {
  return addCorsHeaders(handleCorsPreFlight(request), request);
}

export async function POST(request) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  try {
    const limitResult = await rateLimit(`rate:quotes:${ip}`, 30, 60);
    if (!limitResult.allowed) {
      return addCorsHeaders(
        createErrorResponse('Rate limit exceeded.', 429),
        request
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return addCorsHeaders(
        createErrorResponse('Invalid JSON in request body', 400),
        request
      );
    }

    const validation = validateQuotePayload(body);
    if (!validation.valid) {
      return addCorsHeaders(
        createErrorResponse(validation.message, 422),
        request
      );
    }

    const walletAddress = normalizeWalletAddress(body.walletAddress) || undefined;
    const result = await getAllQuotesWithTimeout({
      fromToken: body.fromToken,
      toToken: body.toToken,
      sendAmount: body.sendAmount,
      walletAddress,
      toAddress: body.toAddress,
      routePriority: body.routePriority,
      settings: body.settings || {},
    });

    return addCorsHeaders(
      new Response(JSON.stringify({ requestId, routes: result }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
      request
    );
  } catch (error) {
    captureServerException(error, { requestId, path: '/api/quotes' });
    return addCorsHeaders(
      new Response(JSON.stringify({ requestId, routes: [], error: 'Internal server error' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }),
      request
    );
  }
}

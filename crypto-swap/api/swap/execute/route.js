import { captureServerException, initServerSentry } from '@/lib/server/sentry.js';
import { getAllQuotes } from '@/lib/engines.js';
import { normalizeWalletAddress, sanitizeRequestBody, validateSwapPayload } from '@/lib/server/validation.js';
import { rateLimit } from '@/lib/server/redis.js';
import { saveSwapHistory, saveAuditRecord } from '@/lib/server/supabase.js';

initServerSentry();

function createErrorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(request) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  try {
    const limitResult = await rateLimit(`rate:swap:${ip}`, 10, 60);
    if (!limitResult.allowed) {
      return createErrorResponse('Rate limit exceeded.', 429);
    }

    const body = await request.json().catch(() => null);
    const validation = validateSwapPayload(body);
    if (!validation.valid) {
      return createErrorResponse(validation.message, 422);
    }

    const destination = normalizeWalletAddress(body.destination);
    if (!destination) {
      return createErrorResponse('Destination wallet is invalid.', 422);
    }

    const quoteRoutes = await getAllQuotes({
      fromToken: body.fromToken,
      toToken: body.toToken,
      sendAmount: body.sendAmount,
      walletAddress: normalizeWalletAddress(body.walletAddress) || '0x0000000000000000000000000000000000000000',
      routePriority: body.routePriority,
      settings: body.settings || {},
    });

    const responsePayload = {
      requestId,
      bestRoute: quoteRoutes[0] || null,
      quoteRoutes,
      executedAt: new Date().toISOString(),
    };

    await saveSwapHistory({
      request_id: requestId,
      ip_address: ip,
      from_token: body.fromToken,
      to_token: body.toToken,
      send_amount: body.sendAmount,
      destination,
      wallet_address: normalizeWalletAddress(body.walletAddress) || null,
      route_priority: body.routePriority,
      result: responsePayload,
      created_at: new Date().toISOString(),
    });

    await saveAuditRecord({
      request_id: requestId,
      event_type: 'swap_execute',
      source_ip: ip,
      source_wallet: normalizeWalletAddress(body.walletAddress) || null,
      destination,
      data: responsePayload,
      created_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    captureServerException(error, { requestId, path: '/api/swap/execute' });
    return createErrorResponse('Unable to execute swap at this time.', 502);
  }
}

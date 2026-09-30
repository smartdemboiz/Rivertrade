import { fetchLiveTokens } from '@/lib/lifi.js';
import { fetchAcrossTokens } from '@/lib/across.js';
import { tokens as staticTokens } from '@/lib/data.js';
import { captureServerException, initServerSentry } from '@/lib/server/sentry.js';

initServerSentry();

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const chainIdParam = url.searchParams.get('chainId');
    const chainsParam = url.searchParams.get('chains');
    
    // Support both single chainId and comma-separated chains
    const chains = chainIdParam 
      ? [Number(chainIdParam)]
      : chainsParam 
        ? chainsParam.split(',').map(Number)
        : undefined;

    // Get static tokens immediately (fast response)
    let tokens = chains 
      ? staticTokens.filter((t) => chains.includes(t.chain))
      : staticTokens;
    
    let isLive = false;
    let timeoutId;

    try {
      // Allow the large upstream token catalog to finish while the client shows static data.
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const liveTokens = await fetchLiveTokens(chains, { signal: controller.signal });
      if (liveTokens && liveTokens.length > 0) {
        tokens = liveTokens;
        isLive = true;
      }
    } catch (liveError) {
      // Try Across below before falling back to the local catalog.
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    if (!isLive) {
      try {
        const acrossTokens = await fetchAcrossTokens(chains);
        if (acrossTokens.length > 0) {
          const mergedTokens = new Map(tokens.map((token) => [
            `${token.chain}:${String(token.address || token.sym).toLowerCase()}`,
            token,
          ]));
          for (const token of acrossTokens) {
            const key = `${token.chain}:${String(token.address || token.sym).toLowerCase()}`;
            mergedTokens.set(key, { ...mergedTokens.get(key), ...token });
          }
          tokens = [...mergedTokens.values()];
          isLive = true;
        }
      } catch (acrossError) {
        // Keep static tokens if both providers are unavailable.
      }
    }
    
    return new Response(JSON.stringify({ tokens, isLive }), {
      status: 200,
      headers: { 
        'content-type': 'application/json',
        'cache-control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    captureServerException(error, { path: '/api/tokens' });
    const url = new URL(request.url);
    const chainIdParam = url.searchParams.get('chainId');
    const chainsParam = url.searchParams.get('chains');
    const chains = chainIdParam 
      ? [Number(chainIdParam)]
      : chainsParam 
        ? chainsParam.split(',').map(Number)
        : undefined;
    const fallbackTokens = chains 
      ? staticTokens.filter((t) => chains.includes(t.chain))
      : staticTokens;
    
    return new Response(JSON.stringify({ error: 'Failed to fetch live tokens', tokens: fallbackTokens, isLive: false }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
}

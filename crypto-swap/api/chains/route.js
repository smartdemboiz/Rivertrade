import { fetchLiveChains } from '@/lib/lifi.js';
import { fetchAcrossChains } from '@/lib/across.js';
import { chains as staticChains } from '@/lib/data.js';
import { captureServerException, initServerSentry } from '@/lib/server/sentry.js';

initServerSentry();

export async function GET(request) {
  try {
    // Return static chains immediately (fast response)
    // Then try to fetch live chains with a timeout for background enhancement
    let chains = staticChains;
    let isLive = false;
    let timeoutId;

    try {
      // Allow the upstream request to finish while the client shows static data.
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const liveChains = await fetchLiveChains({ signal: controller.signal });
      if (liveChains && liveChains.length > 0) {
        chains = liveChains;
        isLive = true;
      }
    } catch (liveError) {
      // Try Across below before falling back to the local catalog.
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    if (!isLive) {
      try {
        const acrossChains = await fetchAcrossChains();
        if (acrossChains.length > 0) {
          chains = acrossChains;
          isLive = true;
        }
      } catch (acrossError) {
        // Keep the local catalog if both providers are unavailable.
      }
    }

    return new Response(JSON.stringify({ chains, isLive }), {
      status: 200,
      headers: { 
        'content-type': 'application/json',
        'cache-control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    captureServerException(error, { path: '/api/chains' });
    return new Response(JSON.stringify({ error: 'Failed to fetch chains', chains: staticChains, isLive: false }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
}

import { captureServerException, initServerSentry } from '@/lib/server/sentry.js';

initServerSentry();

const LLAMA_TIMEOUT = 10000;

async function fetchJson(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LLAMA_TIMEOUT);
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error(`DeFiLlama returned ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET() {
  try {
    const [bridgesJson, chainsJson] = await Promise.all([
      fetchJson('https://bridges.llama.fi/bridges?includeChains=true'),
      fetchJson('https://api.llama.fi/chains'),
    ]);
    const bridges = Array.isArray(bridgesJson?.bridges) ? bridgesJson.bridges : bridgesJson;
    const list = Array.isArray(bridges) ? bridges : [];
    const flows = list
      .filter((bridge) => Array.isArray(bridge.chains) && bridge.chains.length >= 2 && Number(bridge.volumePrevDay) > 0)
      .map((bridge) => ({
        name: bridge.displayName || bridge.name,
        from: bridge.chains[0],
        to: bridge.chains[1],
        volume: Number(bridge.volumePrevDay),
      }))
      .sort((a, b) => b.volume - a.volume);

    return Response.json({
      isLive: true,
      chains: Array.isArray(chainsJson) ? chainsJson.length : 0,
      bridges: list.length,
      volume24h: list.reduce((sum, bridge) => sum + (Number(bridge.volumePrevDay) || 0), 0),
      flows,
      updatedAt: new Date().toISOString(),
    }, { headers: { 'cache-control': 'public, max-age=60, stale-while-revalidate=300' } });
  } catch (error) {
    captureServerException(error, { path: '/api/bridge-stats' });
    return Response.json({ isLive: false, error: 'Live bridge data unavailable' }, { status: 503 });
  }
}
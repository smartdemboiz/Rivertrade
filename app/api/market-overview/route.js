const API = 'https://api.coingecko.com/api/v3';
const COIN_IDS = 'bitcoin,ethereum,solana,ripple';
const CHART_IDS = new Set(COIN_IDS.split(','));

export async function GET(request) {
  const requestedId = new URL(request.url).searchParams.get('selectedId') || 'bitcoin';
  const selectedId = CHART_IDS.has(requestedId) ? requestedId : 'bitcoin';

  try {
    const [coinsResponse, globalResponse] = await Promise.all([
      fetch(`${API}/coins/markets?vs_currency=usd&ids=${COIN_IDS}&order=market_cap_desc&sparkline=false`, {
        next: { revalidate: 60 },
      }),
      fetch(`${API}/global`, { next: { revalidate: 300 } }),
    ]);

    if (!coinsResponse.ok || !globalResponse.ok) {
      return Response.json({ error: 'Market provider is unavailable.' }, { status: 502 });
    }

    const [coins, globalResponseBody] = await Promise.all([
      coinsResponse.json(),
      globalResponse.json(),
    ]);
    const chartResponse = await fetch(
      `${API}/coins/${selectedId}/market_chart?vs_currency=usd&days=1&interval=hourly`,
      { next: { revalidate: 60 } },
    ).catch(() => null);
    const chartBody = chartResponse?.ok ? await chartResponse.json() : null;

    return Response.json({
      coins,
      global: globalResponseBody.data || null,
      chart: Array.isArray(chartBody?.prices) ? chartBody.prices.map((point) => point[1]) : [],
    }, {
      headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return Response.json({ error: 'Market data is temporarily unavailable.' }, { status: 502 });
  }
}
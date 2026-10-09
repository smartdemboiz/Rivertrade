const QUOTE_SYMBOLS = {
  AAPL: "AAPL",
  NVDA: "NVDA",
  gold: "GC=F",
  EUR: "EURUSD=X",
};

async function fetchQuote(key, symbol) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`,
    {
      headers: { "user-agent": "Mozilla/5.0 RiverTrade market quotes" },
      next: { revalidate: 30 },
    },
  );

  if (!response.ok) {
    throw new Error(`The quote provider could not load ${key}.`);
  }

  const result = await response.json();
  const market = result.chart?.result?.[0]?.meta;
  const price = Number(market?.regularMarketPrice);
  const timestamp = Number(market?.regularMarketTime);

  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(timestamp)) {
    throw new Error(`The quote provider returned no valid price for ${key}.`);
  }

  return [key, { price, quotedAt: new Date(timestamp * 1000).toISOString() }];
}

export async function GET() {
  try {
    const entries = await Promise.all(
      Object.entries(QUOTE_SYMBOLS).map(([key, symbol]) => fetchQuote(key, symbol)),
    );
    const quotes = Object.fromEntries(entries);

    return Response.json(
      { quotes },
      { headers: { "cache-control": "public, s-maxage=30, stale-while-revalidate=60" } },
    );
  } catch (error) {
    console.error("[Trade quotes] Failed to load live market quotes.", error);
    return Response.json(
      { error: "Live stock, gold, or currency quotes are temporarily unavailable." },
      { status: 502 },
    );
  }
}

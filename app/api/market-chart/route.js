const API = "https://api.coingecko.com/api/v3";
const CHART_IDS = new Set(["bitcoin", "ethereum", "solana", "ripple"]);
const PERIODS = new Map([
  ["1d", { days: "1", interval: "hourly" }],
  ["1w", { days: "7", interval: "hourly" }],
  ["1m", { days: "30", interval: "daily" }],
  ["6m", { days: "180", interval: "daily" }],
  ["1y", { days: "365", interval: "daily" }],
  ["5y", { days: "1825", interval: "daily" }],
  ["max", { days: "max", interval: "daily" }],
]);

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const coinId = params.get("coinId") || "bitcoin";
  const period = params.get("period") || "1d";
  const range = PERIODS.get(period);

  if (!CHART_IDS.has(coinId) || !range) {
    return Response.json({ error: "Unsupported chart pair or time range." }, { status: 400 });
  }

  try {
    const query = new URLSearchParams({
      vs_currency: "usd",
      days: range.days,
      interval: range.interval,
    });
    const response = await fetch(
      `${API}/coins/${coinId}/market_chart?${query.toString()}`,
      { next: { revalidate: 60 } },
    );

    if (!response.ok) {
      const message = response.status === 429
        ? "The market data provider is rate limiting requests. Please try again shortly."
        : "Live price history is temporarily unavailable.";
      return Response.json({ error: message }, { status: 502 });
    }

    const result = await response.json();
    const prices = Array.isArray(result.prices)
      ? result.prices
        .filter((point) => Array.isArray(point) && Number.isFinite(Number(point[1])))
        .map((point) => Number(point[1]))
      : [];

    if (!prices.length) {
      return Response.json({ error: "No price history is available for this pair and time range." }, { status: 502 });
    }

    return Response.json({ prices }, {
      headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return Response.json({ error: "Unable to load live price history." }, { status: 502 });
  }
}

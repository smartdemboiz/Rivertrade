export async function GET() {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/global?localization=false", {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return Response.json({ error: "Market data unavailable" }, { status: 502 });
    }

    const { data } = await response.json();
    return Response.json({
      marketCap: data.total_market_cap.usd,
      volume: data.total_volume.usd,
      btcDominance: data.market_cap_percentage.btc,
      ethDominance: data.market_cap_percentage.eth,
    });
  } catch {
    return Response.json({ error: "Market data unavailable" }, { status: 502 });
  }
}

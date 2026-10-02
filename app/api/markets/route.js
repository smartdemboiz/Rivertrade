function normalize(coins) {
  return coins.map((coin, index) => ({
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    image: coin.image,
    price: coin.current_price,
    change: coin.price_change_percentage_24h || 0,
    marketcap: coin.market_cap >= 1e12
      ? `${(coin.market_cap / 1e12).toFixed(2)}T`
      : `${(coin.market_cap / 1e9).toFixed(1)}B`,
    rank: coin.market_cap_rank || index + 1,
  }));
}

export async function GET() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&locale=en",
      { next: { revalidate: 60 } },
    );

    if (!response.ok) throw new Error("Markets request failed");
    return Response.json(normalize(await response.json()));
  } catch {
    return Response.json({ error: "Market data is temporarily unavailable." }, { status: 502 });
  }
}

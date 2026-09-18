const fallback = [
  ["Bitcoin", "BTC", 104283.21, 2.84, "2.48T"],
  ["Ethereum", "ETH", 3862.74, 1.92, "465.2B"],
  ["Tether", "USDT", 1, 0.01, "140.8B"],
  ["BNB", "BNB", 712.42, -0.63, "104.1B"],
  ["Solana", "SOL", 238.18, 4.11, "115.3B"],
  ["XRP", "XRP", 2.41, -1.18, "138.7B"],
].map(([name, symbol, price, change, marketcap], index) => ({
  name,
  symbol,
  price,
  change,
  marketcap,
  rank: index + 1,
}));

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
    return Response.json(fallback);
  }
}

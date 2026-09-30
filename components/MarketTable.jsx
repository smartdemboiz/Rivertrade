"use client";

import { useEffect, useMemo, useState } from "react";

const fallback = [
  ["Bitcoin", "BTC", 104283.21, 2.84, "2.06T"],
  ["Ethereum", "ETH", 3862.74, 1.92, "465.2B"],
  ["Tether", "USDT", 1, 0.01, "140.8B"],
  ["BNB", "BNB", 712.42, -0.63, "104.1B"],
  ["Solana", "SOL", 238.18, 4.11, "115.3B"],
  ["XRP", "XRP", 2.41, -1.18, "138.7B"],
].map(([name, symbol, price, change, marketcap], index) => ({
  name,
  symbol,
  image: `/market-icon/s_${symbol.toLowerCase()}.webp`,
  price,
  change,
  marketcap,
  rank: index + 1,
}));

export function MarketTable() {
  const [coins, setCoins] = useState(fallback);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("recent");
  useEffect(() => {
    const refreshMarkets = () => {
      fetch("/api/markets")
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then(setCoins)
        .catch(() => {});
    };

    refreshMarkets();
    const interval = window.setInterval(refreshMarkets, 60000);
    return () => window.clearInterval(interval);
  }, []);
  const visible = useMemo(() => coins
    .filter((coin) => `${coin.name} ${coin.symbol}`.toLowerCase().includes(query.toLowerCase()))
    .filter((coin) => filter !== "gainers" || coin.change > 0)
    .sort((a, b) => filter === "roi" ? Math.abs(b.change) - Math.abs(a.change) : 0), [coins, query, filter]);
  return <div className="market-panel" id="markets"><div className="market-toolbar"><div className="tabs">{["recent", "gainers", "roi"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search coin..." /></div><div className="table-scroll"><table><thead><tr><th>Name</th><th>Rank</th><th>Price</th><th>24h change</th><th>ROI</th><th>Market cap</th></tr></thead><tbody>{visible.map((coin) => <tr key={`${coin.symbol}-${coin.rank}`}><td><span className="coin-icon"><img src={coin.image} alt="" onError={(event) => { if (!event.currentTarget.src.includes("/market-icon/")) { event.currentTarget.src = `/market-icon/s_${coin.symbol.toLowerCase()}.webp`; } else { event.currentTarget.style.display = "none"; } }} />{coin.symbol.slice(0, 1)}</span><strong>{coin.name}</strong><small>{coin.symbol}</small></td><td>{coin.rank}</td><td>${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td><td className={coin.change >= 0 ? "positive" : "negative"}>{coin.change >= 0 ? "+" : ""}{coin.change.toFixed(2)}%</td><td>{(1 + Math.abs(coin.change) / 10).toFixed(2)}x</td><td>${coin.marketcap}</td></tr>)}</tbody></table></div></div>;
}

export default MarketTable;

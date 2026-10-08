"use client";

import { useMemo, useState } from "react";

export function MarketTable({ coins: liveCoins = [] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("recent");
  const coins = liveCoins.map((coin, index) => ({
    name: coin.name,
    symbol: String(coin.symbol || "").toUpperCase(),
    image: coin.image,
    price: coin.current_price,
    change: coin.price_change_percentage_24h || 0,
    marketcap: coin.market_cap >= 1e12
      ? `${(coin.market_cap / 1e12).toFixed(2)}T`
      : `${(coin.market_cap / 1e9).toFixed(1)}B`,
    rank: coin.market_cap_rank || index + 1,
  }));
  const visible = useMemo(() => coins
    .filter((coin) => `${coin.name} ${coin.symbol}`.toLowerCase().includes(query.toLowerCase()))
    .filter((coin) => filter !== "gainers" || coin.change > 0)
    .sort((a, b) => filter === "roi" ? Math.abs(b.change) - Math.abs(a.change) : 0), [coins, query, filter]);
  return <div className="market-panel" id="markets"><div className="market-toolbar"><div className="tabs">{["recent", "gainers", "roi"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search coin..." /></div><div className="table-scroll"><table><thead><tr><th>Name</th><th>Rank</th><th>Price</th><th>24h change</th><th>ROI</th><th>Market cap</th></tr></thead><tbody>{visible.length ? visible.map((coin) => <tr key={`${coin.symbol}-${coin.rank}`}><td><span className="coin-icon"><img src={coin.image} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />{coin.symbol.slice(0, 1)}</span><strong>{coin.name}</strong><small>{coin.symbol}</small></td><td>{coin.rank}</td><td>${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td><td className={coin.change >= 0 ? "positive" : "negative"}>{coin.change >= 0 ? "+" : ""}{coin.change.toFixed(2)}%</td><td>{(1 + Math.abs(coin.change) / 10).toFixed(2)}x</td><td>${coin.marketcap}</td></tr>) : <tr><td className="market-empty" colSpan="6">{coins.length ? "No coins match this filter or search." : "Live market data is currently unavailable."}</td></tr>}</tbody></table></div></div>;
}

export default MarketTable;

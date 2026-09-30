"use client";

import { useState } from "react";

const pairs = [["BTC / USD", "COINBASE:BTCUSD"], ["ETH / USD", "COINBASE:ETHUSD"], ["SOL / USD", "COINBASE:SOLUSD"], ["XRP / USD", "COINBASE:XRPUSD"]];

export function TradingViewChart() {
  const [selectedPair, setSelectedPair] = useState(pairs[0]);
  const url = `https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(selectedPair[1])}&interval=60&theme=dark&style=1&hideideas=1&locale=en`;
  return <div className="overflow-hidden rounded-2xl bg-[#101b1d]"><div className="flex flex-wrap gap-2 border-b border-white/10 p-3">{pairs.map((pair) => <button key={pair[1]} onClick={() => setSelectedPair(pair)} className={`rounded-xl px-3 py-2 text-xs font-black ${selectedPair[1] === pair[1] ? "bg-[#6CF9D8] text-[#101b1d]" : "bg-[#172426] text-[#829697]"}`}>{pair[0]}</button>)}</div><iframe title={`TradingView ${selectedPair[0]} live analysis`} src={url} className="h-[420px] w-full border-0" allow="fullscreen" /></div>;
}

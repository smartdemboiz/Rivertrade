"use client";

import { useState } from "react";
import { chartTypes } from "./chartTypes";
import { MarketMovers } from "./MarketMovers";

export function TradingViewChart({ chartType = "live", data = { coins: [], chart: [] }, onSignup }) {
  const group = chartTypes[chartType] || chartTypes.live;
  const [selectedSymbol, setSelectedSymbol] = useState(group.pairs[0][1]);
  const selectedPair = group.pairs.find((pair) => pair[1] === selectedSymbol) || group.pairs[0];
  const url = `https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(selectedPair[1])}&interval=60&theme=dark&style=1&hideideas=1&locale=en`;

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full max-w-2xl">
        <MarketMovers coins={data.coins} chart={data.chart} onSignup={onSignup} compact />
      </div>
      <div className="w-full overflow-hidden rounded-2xl bg-[#101b1d]">
        <div className="border-b border-white/10 px-3 pt-3">
          <h3 className="mb-3 text-sm font-bold text-white">{group.title}</h3>
          <div className="flex flex-wrap gap-2 pb-3" role="group" aria-label={`${group.title} instruments`}>
            {group.pairs.map((pair) => (
              <button
                key={pair[1]}
                type="button"
                aria-pressed={selectedPair[1] === pair[1]}
                onClick={() => setSelectedSymbol(pair[1])}
                className={`rounded-xl px-3 py-2 text-xs font-black ${selectedPair[1] === pair[1] ? "bg-[#6CF9D8] text-[#101b1d]" : "bg-[#172426] text-[#829697]"}`}
              >
                {pair[0]}
              </button>
            ))}
          </div>
        </div>
        <iframe
          title={`TradingView ${selectedPair[0]} live analysis`}
          src={url}
          className="h-[min(72vh,760px)] min-h-[520px] w-full border-0"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}

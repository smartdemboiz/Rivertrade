"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { coinColors, formatMoney, formatPercent } from "../types/market";
import { useLanguage } from "@/components/LanguageProvider";
import SwapBridge from "@/components/SwapBridge";

const languages = ["en", "es", "fr", "de", "pt", "ja", "zh"];
const swaps = ["Crypto swap", "Limit swap", "Cross-chain swap"];
const marketIconFiles = { bitcoin: "btc", ethereum: "eth", ripple: "xrp", solana: "sol", tether: "usdt" };
const staticMarkets = [
  { id: "nvidia", name: "NVIDIA", symbol: "NVDA", detail: "NVDAx - Semiconductors", price: "229.08", image: "https://cdn.simpleicons.org/nvidia/ffffff", color: "#203d1c" },
  { id: "apple", name: "Apple", symbol: "AAPL", detail: "AAPLx - Consumer Electronics", price: "340.19", image: "https://cdn.simpleicons.org/apple/ffffff", color: "#101010" },
  { id: "tether", name: "Tether", symbol: "USDT", detail: "USDT", price: "1.00", image: "/market-icon/s_usdt.webp", color: "#26a17b" },
  { id: "alphabet", name: "Alphabet (Class A)", symbol: "GOOGL", detail: "GOOGLx - Internet Content & Information", price: "353.00", image: "https://cdn.simpleicons.org/google/111111", color: "#ffffff" },
];
const categories = [["Smart Contract Platform", "858 assets", "2.55T"], ["Layer 1", "418 assets", "2.51T"], ["Proof of Work", "143 assets", "1.79T"], ["Proof of Stake", "136 assets", "601.56B"], ["Stablecoins", "345 assets", "292.15B"]];
const cryptoMarkets = [{ id: "bitcoin", symbol: "BTC" }, { id: "ethereum", symbol: "ETH" }, { id: "ripple", symbol: "XRP" }];
const futuresMarkets = [{ id: "bitcoin", symbol: "BTC Perp" }, { id: "ethereum", symbol: "ETH Perp" }, { id: "solana", symbol: "SOL Perp" }];
const stocks = staticMarkets.slice(0, 3);
const earn = [{ symbol: "SN8", image: "/market-icon/s_eth.webp", color: "#111111" }, { symbol: "SN62", image: "/market-icon/s_dot.webp", color: "#334cff" }, { symbol: "SN51", image: "/market-icon/s_sol.webp", color: "#2674ff" }];

function Icon({ market, size = "h-8 w-8" }) {
  const source = market.image || (market.id && marketIconFiles[market.id] ? `/market-icon/s_${marketIconFiles[market.id]}.webp` : "");
  return <span className={`grid ${size} shrink-0 place-items-center overflow-hidden rounded-full text-xs font-bold text-white`} style={{ backgroundColor: market.color || `${coinColors[market.id] || "#829697"}35` }}>{source ? <img src={source} alt="" className="h-full w-full object-cover" /> : market.symbol?.slice(0, 1)}</span>;
}

function SearchOverlay({ data, onClose }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const live = data.coins.map((coin) => ({ id: coin.id, name: coin.name, symbol: coin.symbol.toUpperCase(), detail: coin.symbol.toUpperCase(), price: formatMoney(coin.current_price, 2).replace("$", ""), change: formatPercent(coin.price_change_percentage_24h), image: coin.image, color: coinColors[coin.id] })).filter((market) => !normalized || `${market.name} ${market.symbol} ${market.detail}`.toLowerCase().includes(normalized));
  const staticMatches = staticMarkets.filter((market) => !normalized || `${market.name} ${market.symbol} ${market.detail}`.toLowerCase().includes(normalized));
  const markets = [...live, ...staticMatches].slice(0, 8);
  return <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-white/10 bg-[#202024] p-4 text-[#E0F3FF] shadow-2xl sm:p-5"><div className="flex items-center gap-3 border-b border-white/10 pb-4"><span className="text-2xl text-[#959bad]">⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find your next trade" className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-[#959bad]" /><button onClick={onClose} className="rounded-xl bg-[#151518] px-3 py-2 text-xs font-bold text-[#E0F3FF]">Esc</button></div><div className="mt-5 flex items-center justify-between text-sm text-[#959bad]"><span>Most popular global markets</span><strong className="text-[#6CF9D8]">LIVE</strong></div><div className="mt-2">{markets.map((market, index) => <div key={market.id} className={`flex items-center gap-4 rounded-xl px-2 py-3 ${index === 1 ? "bg-[#26272B]" : ""}`}><Icon market={market} /><div className="min-w-0 flex-1"><strong className="block truncate">{market.name}</strong><span className="block truncate text-sm text-[#959bad]">{market.detail}</span></div><strong className="text-right">{market.price} <small className="font-normal text-[#959bad]">USD</small></strong></div>)}</div><section className="mt-5 border-t border-white/10 pt-5"><h2 className="text-sm text-[#959bad]">Newly listed crypto</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{["CHEEMS", "COQ", "DEGEN"].map((name, index) => <div key={name} className="rounded-xl border border-white/10 p-4"><Icon market={{ id: ["bitcoin", "ripple", "solana"][index] }} /><strong className="mt-4 block">{name}</strong><span className="mt-1 block text-sm text-[#959bad]">{name === "COQ" ? "Coq Inu" : name[0] + name.slice(1).toLowerCase()}</span><b className="mt-4 block">0.00011</b><span className="text-sm text-[#6CF9D8]">+0.000011</span></div>)}</div></section><section className="mt-5 border-t border-white/10 pt-5"><h2 className="text-sm text-[#959bad]">Categories</h2><div className="mt-2">{categories.map(([name, count, total], index) => <div key={name} className="flex items-center gap-3 py-2"><div className="flex -space-x-2"><Icon market={{ id: ["ethereum", "solana", "bitcoin", "ripple", "tether"][index] }} size="h-7 w-7" /><Icon market={{ id: ["ripple", "ethereum", "tether", "solana", "bitcoin"][index] }} size="h-6 w-6" /></div><div className="min-w-0 flex-1"><strong className="block truncate">{name}</strong><span className="text-xs text-[#959bad]">{count}</span></div><b>{total} <small className="font-normal text-[#959bad]">USD</small></b></div>)}</div></section></div>;
}

function LanguageMenu({ selected, onSelect }) { const [open, setOpen] = useState(false); return <div className="relative z-30 w-full md:w-auto"><button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-1 rounded-xl border border-white/15 bg-[#202024] px-3 py-3 text-xs font-bold text-[#E0F3FF] md:w-auto md:py-2"><span><span className="mr-1 text-[#6CF9D8]">◐</span>{selected.toUpperCase()}</span><span>⌄</span></button>{open && <div className="absolute left-0 right-0 top-12 rounded-xl bg-[#202024] p-1 shadow-xl md:left-auto md:right-0 md:min-w-20">{languages.map((language) => <button key={language} onClick={() => { onSelect(language); setOpen(false); }} className="block w-full rounded-lg px-4 py-2 text-left text-xs text-[#E0F3FF]">{language.toUpperCase()}</button>)}</div>}</div>; }
function SwapMenu({ selected, onSelect, onChoose }) { const [open, setOpen] = useState(false); return <div className="relative"><button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between rounded-xl bg-[#202024] px-3 py-3 text-left font-bold md:w-auto md:py-2">{selected}<span className="text-[#6CF9D8]">⌄</span></button>{open && <div className="absolute left-0 top-12 z-50 min-w-44 rounded-xl bg-[#202024] p-1 shadow-xl">{swaps.map((swap) => <button key={swap} onClick={() => { onSelect(swap); onChoose(swap); setOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-[#E0F3FF]">{swap}</button>)}</div>}</div>; }
const chartMenuItems = [
  ["Live Charts", "live"],
  ["Currency Chart", "currency"],
  ["Futures Chart", "futures"],
  ["Stocks Chart", "stocks"],
  ["Indices Chart", "indices"],
  ["Cryptocurrency Chart", "cryptocurrency"],
];

function ChartMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="relative z-40 w-full text-left md:w-auto" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-xl bg-[#202024] px-3 py-3 font-bold text-[#E0F3FF] md:w-auto md:py-2"
      >
        Charts <span className="ml-2 text-[#6CF9D8]" aria-hidden="true">{open ? "⌃" : "⌄"}</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-64 rounded-lg border border-black/10 bg-white p-4 text-[#151518] shadow-xl md:w-72">
          <h2 className="mb-2 text-sm font-bold">Real Time Charts</h2>
          <div role="menu" aria-label="Real time chart types">
            {chartMenuItems.map(([label, chartType]) => (
              <Link
                key={chartType}
                href={`/charts/${chartType}`}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-none"
              >
                <span aria-hidden="true" className="text-gray-400">→</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MarketColumn({ title, items, data, valueLabel = "PRICE", onViewAll }) { return <section className="min-w-0 p-2"><div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-4 text-[10px] font-bold text-[#959bad]"><h3>{title}</h3><span>{valueLabel}</span><span>24H</span><span aria-hidden="true" /></div><div className="mt-3 grid gap-3">{items.map((item) => { const coin = data.coins.find((entry) => entry.id === item.id); return <a href={`/?market=${item.id}#markets`} key={item.symbol} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-4 py-1 text-xs text-[#151518] transition hover:text-[#58701d]"><span className="flex min-w-0 items-center gap-2 font-bold"><Icon market={{ id: item.id, symbol: item.symbol, image: item.image, color: item.color }} size="h-6 w-6" /><span className="truncate">{item.symbol}</span></span><span>{coin ? formatMoney(coin.current_price, 2) : valueLabel === "APR" ? "APY" : "Provider"}</span><span className={coin ? "text-[#58701d]" : "text-[#58701d]"}>{coin ? formatPercent(coin.price_change_percentage_24h) : ""}</span><strong className="text-[#58701d]">LIVE</strong></a>; })}</div><button type="button" onClick={onViewAll} className="mt-5 inline-flex items-center gap-2 border-0 bg-transparent p-0 text-xs font-black tracking-[1px] text-[#58701d] transition hover:text-[#151518]">VIEW ALL <span aria-hidden="true">→</span></button></section>; }
function MarketsMenu({ data, onViewAll }) { return <div className="absolute left-1/2 top-full z-40 mt-2 max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] max-w-[1180px] -translate-x-1/2 overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-5"><div className="mx-auto flex flex-col gap-7 sm:flex-row sm:gap-8"><div className="shrink-0 text-sm font-bold leading-7 text-[#151518] sm:w-[130px] lg:w-[150px]">Browse prices<br />New listings<br />Crypto categories</div><div className="grid min-w-0 flex-1 grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8"><MarketColumn title="CRYPTO" items={cryptoMarkets} data={data} onViewAll={onViewAll} /><MarketColumn title="STOCKS" items={stocks} data={data} onViewAll={onViewAll} /><MarketColumn title="EARN" items={earn} data={data} valueLabel="APR" onViewAll={onViewAll} /><MarketColumn title="SPOT" items={cryptoMarkets} data={data} onViewAll={onViewAll} /><MarketColumn title="MARGIN" items={cryptoMarkets} data={data} onViewAll={onViewAll} /><MarketColumn title="FUTURES" items={futuresMarkets} data={data} onViewAll={onViewAll} /></div></div></div>; }

export function SiteHeader({ onDashboard, onLogin, onSignup, data = { coins: [] } }) {
  const [mobileOpen, setMobileOpen] = useState(false); const [marketsOpen, setMarketsOpen] = useState(false); const [searchOpen, setSearchOpen] = useState(false); const { language, setLanguage } = useLanguage(); const [swap, setSwap] = useState(swaps[0]); const [swapBridgeMode, setSwapBridgeMode] = useState("");
  const goToMarkets = () => { setMarketsOpen(false); setMobileOpen(false); if (typeof window !== "undefined" && window.location.pathname === "/") { document.getElementById("markets")?.scrollIntoView({ behavior: "smooth" }); } else if (typeof window !== "undefined") { window.location.href = "/#markets"; } };
  return <header className="sticky top-0 z-20 w-full bg-[#151518] px-3 py-3 text-white sm:px-5"><div className="flex min-h-[48px] items-center justify-between gap-3"><button onClick={onDashboard} className="shrink-0" aria-label="RiverTrade home"><Image src="/icoinred/logo-88256519050c5e84fcbd2120a81b2097.svg" alt="RiverTrade" width={1800} height={700} className="h-14 w-auto" /></button><nav className="hidden items-center gap-2 text-sm font-black md:flex"><ChartMenu /><button onClick={() => setMarketsOpen((value) => !value)} className="px-3 py-2">Markets⌄</button><SwapMenu selected={swap} onSelect={setSwap} onChoose={setSwapBridgeMode} /><LanguageMenu selected={language} onSelect={setLanguage} /><button onClick={() => setSearchOpen(true)} className="rounded-xl bg-[#202024] px-3 py-2">⌕ Search /</button><button onClick={onLogin} className="rounded-xl bg-[#E0F3FF] px-3 py-2 text-[#151518]">Log in</button><button onClick={onSignup} className="rounded-xl bg-[#6CF9D8] px-3 py-2 text-[#151518]">Sign up</button></nav><button onClick={() => setMobileOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-xl bg-[#202024] text-xl md:hidden">{mobileOpen ? "×" : "☰"}</button></div>{marketsOpen && <MarketsMenu data={data} onViewAll={goToMarkets} />}{mobileOpen && <div className="mt-3 space-y-3 rounded-2xl bg-[#202024] p-3 md:hidden"><ChartMenu /><button onClick={() => setMarketsOpen((value) => !value)} className="w-full rounded-xl px-3 py-3 text-left font-bold">Markets⌄</button><SwapMenu selected={swap} onSelect={setSwap} onChoose={setSwapBridgeMode} /><LanguageMenu selected={language} onSelect={setLanguage} /><button onClick={() => setSearchOpen(true)} className="w-full rounded-xl bg-[#151518] px-3 py-3 text-left font-bold">⌕ Search markets</button><div className="grid grid-cols-2 gap-2"><button onClick={onLogin} className="rounded-xl bg-[#E0F3FF] py-3 font-bold text-[#151518]">Log in</button><button onClick={onSignup} className="rounded-xl bg-[#6CF9D8] py-3 font-bold text-[#151518]">Sign up</button></div></div>}{searchOpen && <SearchOverlay data={data} onClose={() => setSearchOpen(false)} />}{swapBridgeMode && <SwapBridge mode={swapBridgeMode} onClose={() => setSwapBridgeMode("")} />}</header>;
}

export default SiteHeader;

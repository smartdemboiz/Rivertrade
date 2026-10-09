import { MarketTable } from "./MarketTable";
import { SiteHeader } from "./SiteHeader";
import Image from "next/image";
import { formatMoney, formatPercent } from "../types/market";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import SwapBridge from "@/components/SwapBridge";
import { SiApple } from "react-icons/si";

const tradePairs = [
  {
    from: { symbol: "BTC", name: "Bitcoin", logo: "/market-icon/s_btc.webp", color: "#f7931a", priceSource: "crypto", priceKey: "bitcoin", unit: "BTC" },
    to: { symbol: "AAPL", name: "Apple stock", icon: SiApple, color: "#080908", priceSource: "market", priceKey: "AAPL", unit: "AAPL" },
  },
  {
    from: { symbol: "Au", name: "Gold", logo: "/market-icon/gold-au.svg", color: "#ad8a4e", priceSource: "market", priceKey: "gold", unit: "oz" },
    to: { symbol: "NVDA", name: "NVIDIA stock", logo: "/market-icon/nvda_e98uy23454378.webp", color: "#080908", priceSource: "market", priceKey: "NVDA", unit: "NVDA" },
  },
  {
    from: { symbol: "ETH", name: "Ethereum", logo: "/market-icon/s_eth.webp", color: "#627eea", priceSource: "crypto", priceKey: "ethereum", unit: "ETH" },
    to: { symbol: "EUR", name: "Euro", logo: "/market-icon/eur-19876543567.svg", color: "#3156a5", priceSource: "market", priceKey: "EUR", unit: "EUR" },
  },
  {
    from: { symbol: "SOL", name: "Solana", logo: "/market-icon/s_sol.webp", color: "#7855d6", priceSource: "crypto", priceKey: "solana", unit: "SOL" },
    to: { symbol: "Au", name: "Gold", logo: "/market-icon/gold-au.svg", color: "#ad8a4e", priceSource: "market", priceKey: "gold", unit: "oz" },
  },
  {
    from: { symbol: "XRP", name: "XRP", logo: "/market-icon/s_xrp.webp", color: "#23292f", priceSource: "crypto", priceKey: "ripple", unit: "XRP" },
    to: { symbol: "USDT", name: "Tether", logo: "/market-icon/s_usdt.webp", color: "#26a17b", priceSource: "crypto", priceKey: "tether", unit: "USDT" },
  },
  {
    from: { symbol: "BTC", name: "Bitcoin", logo: "/market-icon/s_btc.webp", color: "#f7931a", priceSource: "crypto", priceKey: "bitcoin", unit: "BTC" },
    to: { symbol: "ETH", name: "Ethereum", logo: "/market-icon/s_eth.webp", color: "#627eea", priceSource: "crypto", priceKey: "ethereum", unit: "ETH" },
  },
  {
    from: { symbol: "SOL", name: "Solana", logo: "/market-icon/s_sol.webp", color: "#7855d6", priceSource: "crypto", priceKey: "solana", unit: "SOL" },
    to: { symbol: "USDC", name: "USD Coin", logo: "/market-icon/s_usdc.webp", color: "#2775ca", priceSource: "crypto", priceKey: "usd-coin", unit: "USDC" },
  },
  {
    from: { symbol: "ADA", name: "Cardano", logo: "/market-icon/s_ada.webp", color: "#3468d1", priceSource: "crypto", priceKey: "cardano", unit: "ADA" },
    to: { symbol: "DOGE", name: "Dogecoin", logo: "/market-icon/s_doge.webp", color: "#c2a633", priceSource: "crypto", priceKey: "dogecoin", unit: "DOGE" },
  },
  {
    from: { symbol: "DOT", name: "Polkadot", logo: "/market-icon/s_dot.webp", color: "#e6007a", priceSource: "crypto", priceKey: "polkadot", unit: "DOT" },
    to: { symbol: "LTC", name: "Litecoin", logo: "/market-icon/s_ltc.webp", color: "#345d9d", priceSource: "crypto", priceKey: "litecoin", unit: "LTC" },
  },
  {
    from: { symbol: "LINK", name: "Chainlink", logo: "/market-icon/s_link.webp", color: "#2a5ada", priceSource: "crypto", priceKey: "chainlink", unit: "LINK" },
    to: { symbol: "XRP", name: "XRP", logo: "/market-icon/s_xrp.webp", color: "#23292f", priceSource: "crypto", priceKey: "ripple", unit: "XRP" },
  },
  {
    from: { symbol: "XLM", name: "Stellar", logo: "/market-icon/s_xlm.webp", color: "#111111", priceSource: "crypto", priceKey: "stellar", unit: "XLM" },
    to: { symbol: "XMR", name: "Monero", logo: "/market-icon/s_xmr.webp", color: "#f26822", priceSource: "crypto", priceKey: "monero", unit: "XMR" },
  },
];

const formatTradeAmount = (amount) => new Intl.NumberFormat("en-US", {
  maximumFractionDigits: amount < 0.01 ? 6 : amount < 1 ? 4 : 2,
}).format(amount);

const testimonials = [
  ["Diego_1280x720_unlocalised@2x.jpg", "Diego Johnson", "I am a living witness to this company, for some years now I have been receiving my investment and my profit, this is one of the best company to invest on cryptocurrencies"],
  ["Steven_Hatzakis _170x170.webp", "Steven Hatzakis", "Holding a Bitcoin today is like owning a Facebook, Amazon, or Apple stock positions in the early 2000's. Blockchain technology has a lot more on offer if you could just adopt it. I will always advise people to invest in this company."],
  ["joey_Shadeck.webp", "Joey Shadeck", "Bitcoin is up 60% on the year while the almighty GOLD is down by 11%, and yet still hate investing in BTC for the long run? Math doesn't lie, the media does"],
  ["private-client-man-08e033759930e9900a5601ce2556abc2.jpg", "Jim Cramer", "Anything the government hates or ban, invest in it and spend time to understand it better. That could be your missing piece. Bitcoin is a perfect example of such! I am always grateful to this amazing company for being the best."],
  ["preston-d819514ab2aff1f63db2c5dc7fdfa1ce.jpg", "Preston Pysh", "In the next 5-10 years, digital assets (predominantly Bitcoin and few Alts) will prove to be a strong alternative currency of the world, if not entirely dethrone fiat currency. this is one of the Forex trading company."],
  ["b9f89f516a2fe649a582c2a79c68b54e.jpg", "Dayan Du Dosson", "Great platform to invest your money. I advice you use this"],
  ["laura-irish-faeb36fb050b50c4bd65b672f95f4c70.jpg", "Laura Irish", "This website is so great. Now I have my own business. I'm really happy. I will trading under your website"],
  ["hoffmeister-greg-dbb0c75423763eb27975341e8241c094.jpg", "Greg Hoffmeister", "All you just need to do is invest and let them do their work after making withdrawal you pay their for a job well done. They has never made loss on part so please y'all can reach out to this platform"],
  ["John-Bringans.webp", "John Bringans", "I'm still shocked. I never believed I can ever make profit from trading after all the lost but never gave up"],
  ["photo_2025-10-26_13-43-04.jpg", "Jasmine Marcus", "Wow, what a surprise, did I just got my withdrawal? Is this real or a joke, I can't believe this. thank you very much is amazing"],
  ["dom-bei-7f0538aa8d3877270b84661f5e87a0ad.jpg", "Bei Wilson", "You all are the best, and am looking forward to trade with this platform all again. Feel free to tell others of your investment and withdrawals."],
  ["6a13ca5cb7536acada3f32ee1d5783de.jpg", "Patricia Feghhi-Levine", "Just a quick thanks for your website!! You are a worthwhile mentor. I think there are thousands who truly appreciate what you are doing!"],
];

export function LandingPage({ data = { coins: [], global: null }, authenticated = false, onDashboard, onLogin, onSignup }) {
  const { t } = useLanguage();
  const btc = data.coins.find((coin) => coin.id === "bitcoin");
  const testimonialTrackRef = useRef(null);
  const [amount, setAmount] = useState("1");
  const [currency, setCurrency] = useState("USD");
  const [swapBridgeOpen, setSwapBridgeOpen] = useState(false);
  const [tradePairIndex, setTradePairIndex] = useState(0);
  const [tradePairState, setTradePairState] = useState("ready");
  const [liveQuotes, setLiveQuotes] = useState(null);
  const [liveQuotesError, setLiveQuotesError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const pairTransitionTimersRef = useRef([]);
  const rates = { USD: 1, EUR: 0.92, GBP: 0.78, CAD: 1.36, JPY: 149 };
  const convertedValue = Number(amount || 0) * (btc?.current_price || 0) * rates[currency];
  const formattedValue = new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(convertedValue);
  const activeTradePair = tradePairs[tradePairIndex];
  const FromAssetIcon = activeTradePair.from.icon;
  const ToAssetIcon = activeTradePair.to.icon;
  const cryptoQuotes = new Map(data.coins.map((coin) => [coin.id, coin]));
  const getAssetQuote = (asset) => {
    if (asset.priceSource === "market") {
      return liveQuotes?.[asset.priceKey] || null;
    }
    const coin = cryptoQuotes.get(asset.priceKey);
    return Number.isFinite(Number(coin?.current_price))
      ? { price: Number(coin.current_price), quotedAt: data.updated?.toISOString?.() || null }
      : null;
  };
  const fromQuote = getAssetQuote(activeTradePair.from);
  const toQuote = getAssetQuote(activeTradePair.to);
  const convertedAmount = fromQuote && toQuote ? fromQuote.price / toQuote.price : null;
  const liveQuoteTime = [fromQuote?.quotedAt, toQuote?.quotedAt]
    .filter(Boolean)
    .map((time) => new Date(time).getTime())
    .filter(Number.isFinite);
  const quoteTimestamp = liveQuoteTime.length ? Math.min(...liveQuoteTime) : null;
  const quoteStatusLabel = quoteTimestamp && currentTime && currentTime - quoteTimestamp <= 15 * 60 * 1000
    ? "Live quote"
    : "Latest quote";
  const liveQuoteTimeLabel = quoteTimestamp
    ? new Date(quoteTimestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    : null;
  const advanceTradePair = useCallback((direction = 1) => {
    setTradePairIndex((current) => (current + direction + tradePairs.length) % tradePairs.length);
    setTradePairState("swapping");
    pairTransitionTimersRef.current.forEach((timer) => clearTimeout(timer));
    pairTransitionTimersRef.current = [
      setTimeout(() => setTradePairState("complete"), 2200),
      setTimeout(() => setTradePairState("ready"), 3300),
    ];
  }, []);

  useEffect(() => {
    const interval = setInterval(() => advanceTradePair(), 5200);
    return () => {
      clearInterval(interval);
      pairTransitionTimersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, [advanceTradePair]);

  useEffect(() => {
    let disposed = false;
    let timer;
    let controller;

    const loadQuotes = async () => {
      controller = new AbortController();
      try {
        const response = await fetch("/api/trade-quotes", { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Live quotes are unavailable.");
        if (!result.quotes || !["AAPL", "NVDA", "gold", "EUR"].every((key) => Number.isFinite(Number(result.quotes[key]?.price)))) {
          throw new Error("The live quote response is incomplete.");
        }
        if (!disposed) {
          setLiveQuotes(result.quotes);
          setLiveQuotesError(false);
        }
      } catch (error) {
        if (!disposed && error.name !== "AbortError") {
          setLiveQuotes(null);
          setLiveQuotesError(true);
          console.error("[Trade showcase] Failed to load live quotes.", error);
        }
      } finally {
        if (!disposed) {
          setCurrentTime(Date.now());
          timer = setTimeout(loadQuotes, 30000);
        }
      }
    };

    loadQuotes();
    return () => {
      disposed = true;
      clearTimeout(timer);
      controller?.abort();
    };
  }, []);

  return (
    <>
      <SiteHeader onDashboard={onDashboard} onLogin={onLogin} onSignup={onSignup} data={data} />
      {swapBridgeOpen && <SwapBridge mode="Crypto swap" onClose={() => setSwapBridgeOpen(false)} />}
      <main className="legacy-home min-h-screen bg-background px-5 text-foreground">
      <div className="mx-auto max-w-7xl">
        <section className="max-w-3xl py-24">
          <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-[-2px] sm:text-7xl">{t("heroTitle")}</h1>
          <p className="mt-6 max-w-xl text-lg leading-7 text-muted">{t("heroLead")}</p>
          <button onClick={onSignup} className="mt-8 rounded-full bg-brand px-6 py-4 font-black text-foreground">{t("getStarted")} →</button>
        </section>
        <section className="flex flex-wrap gap-10 border-y border-black/15 py-7">
          <div><strong className="block text-3xl font-black">{data.global ? formatMoney(data.global.total_volume.usd) : "--"}</strong><span className="text-xs font-bold uppercase tracking-[1px] text-muted">{t("total24hVolume")}</span></div>
          <div><strong className="block text-3xl font-black">{data.global ? formatMoney(data.global.total_market_cap.usd) : "--"}</strong><span className="text-xs font-bold uppercase tracking-[1px] text-muted">{t("totalMarketCap")}</span></div>
        </section>
        <section id="markets" className="py-16">
          <div className="mb-5 flex items-end justify-between"><p className="text-xs font-black uppercase tracking-[2px] text-olive">{t("exploreMarkets")}</p><span className="text-sm font-black text-olive">{t("liveData")}</span></div>
          {data.loading && !data.coins.length ? <p className="text-muted">{t("connectingMarkets")}</p> : data.error && !data.coins.length ? <p className="text-muted" role="status">Live market data is temporarily unavailable.</p> : <MarketTable coins={data.coins} />}
        </section>
        <section className="trade-anything-section relative left-1/2 w-screen -translate-x-1/2">
          <div className="trade-anything-layout">
            <div className="trade-anything-copy">
              <span className="trade-anything-label">Trade</span>
              <h2>Trade anything<br />to anything<span>.</span></h2>
              <p>
                Swap crypto, stocks, metals and currencies in one step —
                <strong> no cashing out in between.</strong>
                <br />The easiest trading experience.
              </p>
              <button type="button" onClick={() => setSwapBridgeOpen(true)} className="trade-anything-cta">
                Start Trading
              </button>
            </div>
            <div className="trade-anything-visual">
              <div className="trade-anything-orbit" />
              <div
                key={`${tradePairIndex}-from`}
                className="trade-anything-card trade-anything-card-send"
              >
                <span className="trade-anything-asset-icon" style={{ backgroundColor: activeTradePair.from.color }}>
                  {activeTradePair.from.logo
                    ? <Image src={activeTradePair.from.logo} alt="" width={64} height={64} className="h-full w-full rounded-full object-cover" />
                    : FromAssetIcon
                    ? <FromAssetIcon aria-hidden="true" />
                    : activeTradePair.from.symbol}
                </span>
                <strong>{activeTradePair.from.symbol}</strong>
                <span className="trade-anything-amount">{fromQuote ? "1.00" : "--"}</span>
                <span className="trade-anything-rate">{fromQuote ? `Input amount · ${activeTradePair.from.unit}` : "Waiting for quote"}</span>
              </div>
              <div
                key={`${tradePairIndex}-to`}
                className="trade-anything-card trade-anything-card-receive"
              >
                <span className="trade-anything-asset-icon" style={{ backgroundColor: activeTradePair.to.color }}>
                  {activeTradePair.to.logo
                    ? <Image src={activeTradePair.to.logo} alt="" width={64} height={64} className="h-full w-full rounded-full object-cover" />
                    : ToAssetIcon
                    ? <ToAssetIcon aria-hidden="true" />
                    : activeTradePair.to.symbol}
                </span>
                <strong>{activeTradePair.to.symbol}</strong>
                <span className="trade-anything-amount">
                  {Number.isFinite(convertedAmount) && convertedAmount > 0 ? formatTradeAmount(convertedAmount) : "--"}
                </span>
                <span className="trade-anything-rate">
                  {Number.isFinite(convertedAmount) && convertedAmount > 0
                    ? `${quoteStatusLabel} · ${activeTradePair.to.unit}`
                    : liveQuotesError ? "Live quote unavailable" : "Loading live quote"}
                </span>
              </div>
              <div
                className={`trade-anything-arrow trade-anything-arrow-${tradePairState}`}
                aria-hidden="true"
              >
                {tradePairState === "complete" ? "✓" : tradePairState === "swapping" ? "→" : "⇄"}
              </div>
              <div className="trade-anything-complete" aria-live="polite">
                <span>{tradePairState === "complete" ? "✓" : "↗"}</span>
                {Number.isFinite(convertedAmount) && convertedAmount > 0
                  ? `1 ${activeTradePair.from.unit} ≈ ${formatTradeAmount(convertedAmount)} ${activeTradePair.to.unit} · ${quoteStatusLabel}${liveQuoteTimeLabel ? ` · ${liveQuoteTimeLabel}` : ""}`
                  : "Live conversion quote unavailable"}
              </div>
            </div>
          </div>
        </section>
        <section id="about" className="cursor-pointer rounded-3xl bg-brand p-8" onClick={onDashboard} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onDashboard(); }} role="button" tabIndex={0}><p className="text-xs font-black uppercase tracking-[2px] text-foreground/70">{t("builtForNext")}</p><h2 className="mt-3 max-w-xl text-4xl font-black">{t("clearView")}</h2><button onClick={(event) => { event.stopPropagation(); onDashboard(); }} className="mt-6 rounded-full bg-surface-strong px-5 py-3 font-black text-white">{t("openDashboard")} →</button></section>
        <section id="bitcoin-calculator" className="relative left-1/2 w-screen -translate-x-1/2 bg-deep px-5 py-20 text-white sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-2xl font-black uppercase tracking-[4px] text-gold sm:text-3xl">{t("bitcoinCalculator")}</p>
            <p className="mt-5 text-base text-[#f5f5f5] sm:text-xl">{t("calculatorLead")}</p>
            <div className="mx-auto mt-10 grid max-w-3xl gap-3 rounded-2xl bg-white p-3 text-foreground sm:grid-cols-[1fr_auto_auto_1fr_auto] sm:items-center sm:gap-4 sm:p-6">
              <label className="sr-only" htmlFor="bitcoin-amount">{t("bitcoinAmount")}</label>
              <input id="bitcoin-amount" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} className="min-w-0 rounded-lg border-2 border-black/15 px-4 py-4 text-center text-lg outline-none focus:border-gold" />
              <span className="text-3xl text-gold" aria-hidden="true">₿</span>
              <span className="text-2xl font-bold text-[#a77b4b]" aria-hidden="true">=</span>
              <output className="rounded-lg border-2 border-black/15 px-4 py-4 text-center text-lg" htmlFor="bitcoin-amount">{formattedValue}</output>
              <label className="sr-only" htmlFor="bitcoin-currency">{t("displayCurrency")}</label>
              <select id="bitcoin-currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className="rounded-lg border-2 border-black/15 bg-white px-4 py-4 text-center text-lg outline-none focus:border-gold"><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>JPY</option></select>
            </div>
            <p className="mt-5 text-sm text-muted-soft">* {t("updatedFromLive")}{data.updated ? ` · Updated ${data.updated.toLocaleTimeString()}` : ""}</p>
          </div>
        </section>
        <section className="relative left-1/2 flex min-h-105 w-screen -translate-x-1/2 items-center justify-center overflow-hidden bg-[#08080a] px-6 py-20 text-center text-white sm:min-h-130" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.72)), url('/Image/mobile/desktop-BATS-Trading_Page-wide_2x.jpg')", backgroundPosition: "center", backgroundSize: "cover" }}>
          <div className="relative max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[3px] text-gold">Rivertrade</p>
            <h1 className="mt-6 text-5xl font-medium leading-tight sm:text-7xl">{t("secureTransactions")}</h1>
            <p className="mt-5 text-lg text-[#f5f5f5] sm:text-xl">{t("openAccount")}</p>
            <button onClick={onSignup} className="mt-7 rounded-lg bg-brand px-10 py-4 font-bold text-foreground transition hover:bg-brand-strong">Get started</button>
          </div>
        </section>
        <section className="Customertestimonials">
          <div className="legacy-heading centered">
            <span>{t("clientStories")}</span>
            <h2>{t("trustedPeople")}</h2>
          </div>
          <div className="testimonialtrack" ref={testimonialTrackRef}>
            {testimonials.concat(testimonials).map(([image, name, quote], index) => (
              <article className="customertext" key={`${name}-${index}`}>
                <img src={`/Image/${encodeURIComponent(image)}`} alt={name} />
                <p>{quote}</p>
                <strong>{name}</strong>
                <div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
              </article>
            ))}
          </div>
        </section>
        <footer className="relative left-1/2 mt-16 w-screen -translate-x-1/2 border-t-2 border-brand bg-surface-strong px-6 py-9 text-background sm:px-10 lg:px-16">
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/15 pb-8">
            <Image src="/icoinred/logo-88256519050c5e84fcbd2120a81b2097.svg" alt="RiverTrade" width={1800} height={700} className="h-14 w-auto" />
            <div className="flex items-center gap-5 text-lg font-black"><span className="mr-1 text-base font-normal text-background/70">{t("followUs")}</span><a href="#about" aria-label="River on X" className="text-background transition hover:text-brand">X</a><a href="#about" aria-label="River on social network" className="text-background transition hover:text-brand">◎</a><a href="#about" aria-label="River on LinkedIn" className="text-background transition hover:text-brand">in</a><a href="#about" aria-label="River on music network" className="text-background transition hover:text-brand">♪</a><a href="#about" aria-label="River video channel" className="text-background transition hover:text-brand">▶</a></div>
          </div>
          <div className="grid gap-9 pt-12 sm:grid-cols-[1fr_1fr_1.2fr_1.8fr]">
            <div><h2 className="text-xl font-black text-background">{t("product")}</h2><a href="#markets" className="mt-5 block text-lg text-background/90 transition hover:text-brand">{t("markets")}</a></div>
            <div><h2 className="text-xl font-black text-background">{t("company")}</h2><a href="/about" className="mt-5 block text-lg text-background/90 transition hover:text-brand">{t("aboutUsFooter")}</a><a href="/contact" className="mt-4 block text-lg text-background/90 transition hover:text-brand">{t("supportFooter")}</a><a href="/about#careers" className="mt-4 block text-lg text-background/90 transition hover:text-brand">{t("careersFooter")}</a></div>
            <div><h2 className="text-xl font-black text-background">{t("legal")}</h2><a href="/pdf%20docum/Terms%20and%20Conditions.pdf" target="_blank" rel="noopener noreferrer" className="mt-5 block text-lg text-background/90 transition hover:text-brand">{t("terms")}</a><a href="/disclosures" className="mt-4 block text-lg text-background/90 transition hover:text-brand">{t("disclosuresFooter")}</a><a href="/pdf%20docum/Law-Enforcement-Request.pdf" target="_blank" rel="noopener noreferrer" className="mt-4 block text-lg text-background/90 transition hover:text-brand">{t("lawRequests")}</a></div>
            <div><h2 className="text-xl font-black text-background">{t("secureTransactions")}.</h2><p className="mt-7 text-lg leading-7 text-background/90"><strong className="text-background">{t("brokerage")}</strong> are offered through River Financial LLC (“RHF”), a registered broker dealer...</p><p className="mt-6 text-lg leading-7 text-background/90"><strong className="text-background">{t("portfolio")}</strong> offered through Rivertrade Asset Management LLC (“RAM”)...</p><p className="mt-6 text-lg leading-7 text-background/90"><strong className="text-background">{t("futures")}</strong> is offered by River Derivatives, LLC (“RHD”)...</p></div>
          </div>
        </footer>
      </div>
      </main>
    </>
  );
}

export default LandingPage;

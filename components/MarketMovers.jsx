"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Calculator, Lightbulb, Trophy } from "lucide-react";
import styles from "./MarketMovers.module.css";

const filters = [
  { id: "active", label: "Most Active" },
  { id: "gainers", label: "Gainers %" },
  { id: "losers", label: "Losers %" },
];

const cryptoPairs = [
  { id: "bitcoin", label: "BTC/USD", name: "Bitcoin", symbol: "BTC", tradingViewSymbol: "BINANCE:BTCUSDT" },
  { id: "ethereum", label: "ETH/USD", name: "Ethereum", symbol: "ETH", tradingViewSymbol: "BINANCE:ETHUSDT" },
  { id: "solana", label: "SOL/USD", name: "Solana", symbol: "SOL", tradingViewSymbol: "BINANCE:SOLUSDT" },
  { id: "ripple", label: "XRP/USD", name: "XRP", symbol: "XRP", tradingViewSymbol: "BINANCE:XRPUSDT" },
];

const chartPeriods = [
  { id: "1d", label: "1D", tradingViewInterval: "15" },
  { id: "1w", label: "1W", tradingViewInterval: "60" },
  { id: "1m", label: "1M", tradingViewInterval: "D" },
  { id: "6m", label: "6M", tradingViewInterval: "D" },
  { id: "1y", label: "1Y", tradingViewInterval: "D" },
  { id: "5y", label: "5Y", tradingViewInterval: "W" },
  { id: "max", label: "Max", tradingViewInterval: "M" },
];

const categories = [
  { id: "crypto", label: "Crypto" },
  { id: "indices", label: "Indices", instruments: [["US 30", "TVC:DJI"], ["US 500", "SP:SPX"], ["Nasdaq 100", "NASDAQ:NDX"], ["VIX", "TVC:VIX"]] },
  { id: "commodities", label: "Commodities", instruments: [["Gold", "TVC:GOLD"], ["Silver", "TVC:SILVER"], ["Crude Oil", "NYMEX:CL1!"], ["Natural Gas", "NYMEX:NG1!"]] },
  { id: "bonds", label: "Bonds", instruments: [["US 2Y Yield", "TVC:US02Y"], ["US 10Y Yield", "TVC:US10Y"], ["US 30Y Yield", "TVC:US30Y"]] },
  { id: "stocks", label: "Stocks", instruments: [["Apple", "NASDAQ:AAPL"], ["NVIDIA", "NASDAQ:NVDA"], ["Microsoft", "NASDAQ:MSFT"], ["Tesla", "NASDAQ:TSLA"]] },
];

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumSignificantDigits: 6,
});

const volumeFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const quickLinks = [
  { label: "Markets", href: "#markets", Icon: BarChart3 },
  { label: "Live analysis", href: "#live-analysis", Icon: Lightbulb },
  { label: "Challenges", href: "#investing-challenges", Icon: Trophy },
  { label: "Tools", href: "#bitcoin-calculator", Icon: Calculator },
];

function PriceChart({ prices = [], positive, pairLabel, periodLabel }) {
  const points = useMemo(() => {
    if (!prices.length) return "";
    const values = prices.map(Number).filter(Number.isFinite);
    if (!values.length) return "";
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min || 1;

    const line = values.map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 92 - ((value - min) / spread) * 82;
      return `${x},${y}`;
    });
    return {
      line: line.join(" "),
      area: `0,100 ${line.join(" ")} 100,100`,
    };
  }, [prices]);

  return (
    <div className={styles.chart} role="img" aria-label={`${pairLabel} price movement over ${periodLabel}`}>
      {points ? (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 10H100M0 50H100M0 90H100" className={styles.gridLine} />
          <polygon points={points.area} className={positive ? styles.chartAreaPositive : styles.chartAreaNegative} />
          <polyline points={points.line} className={positive ? styles.chartPositive : styles.chartNegative} />
        </svg>
      ) : (
        <p>Live price chart is unavailable.</p>
      )}
      <div className={styles.chartTimes}><span>{periodLabel} ago</span><span>Now</span></div>
    </div>
  );
}

export function MarketMovers({ coins = [], chart = [], onSignup, compact = false }) {
  const [filter, setFilter] = useState("active");
  const [categoryId, setCategoryId] = useState("crypto");
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedPairId, setSelectedPairId] = useState("bitcoin");
  const [periodId, setPeriodId] = useState("1d");
  const [chartPrices, setChartPrices] = useState(chart);
  const [chartError, setChartError] = useState("");
  const [chartLoading, setChartLoading] = useState(false);
  const selectedPair = cryptoPairs.find((pair) => pair.id === selectedPairId) || cryptoPairs[0];
  const selectedPeriod = chartPeriods.find((period) => period.id === periodId) || chartPeriods[0];
  const activeCoin = coins.find((coin) => coin.id === selectedPair.id);
  const category = categories.find((item) => item.id === categoryId) || categories[0];
  const activeInstrument = category.instruments?.find((instrument) => instrument[1] === selectedInstrument)
    || category.instruments?.[0];

  useEffect(() => {
    const controller = new AbortController();

    async function loadChart() {
      setChartLoading(true);
      setChartError("");

      try {
        const query = new URLSearchParams({ coinId: selectedPairId, period: periodId });
        const response = await fetch(`/api/market-chart?${query.toString()}`, {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Unable to load live price history.");
        }
        setChartPrices(result.prices);
      } catch (error) {
        if (error.name !== "AbortError") {
          setChartPrices([]);
          setChartError(error instanceof Error ? error.message : "Unable to load live price history.");
        }
      } finally {
        if (!controller.signal.aborted) setChartLoading(false);
      }
    }

    loadChart();
    return () => controller.abort();
  }, [selectedPairId, periodId]);

  const movers = useMemo(() => {
    const sorted = [...coins].sort((first, second) => {
      if (filter === "gainers") {
        return (Number(second.price_change_percentage_24h) || 0)
          - (Number(first.price_change_percentage_24h) || 0);
      }
      if (filter === "losers") {
        return (Number(first.price_change_percentage_24h) || 0)
          - (Number(second.price_change_percentage_24h) || 0);
      }
      return (Number(second.total_volume) || 0) - (Number(first.total_volume) || 0);
    });

    const limit = compact ? 5 : 7;
    return filter === "gainers"
      ? sorted.filter((coin) => Number(coin.price_change_percentage_24h) > 0).slice(0, limit)
      : filter === "losers"
        ? sorted.filter((coin) => Number(coin.price_change_percentage_24h) < 0).slice(0, limit)
        : sorted.slice(0, limit);
  }, [coins, compact, filter]);

  return (
    <aside className={`${styles.panel} ${compact ? styles.compact : ""}`} aria-labelledby="market-movers-heading">
      <div className={styles.dashboard}>
        <div className={styles.content}>
          <div className={styles.chartHeading}>
            <div className={styles.marketTabs} role="tablist" aria-label="Market category">
              {categories.map((item) => (
                <button
                  key={item.id}
                  id={`market-tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={categoryId === item.id}
                  aria-controls={`market-panel-${item.id}`}
                  className={categoryId === item.id ? styles.selectedTab : ""}
                  onClick={() => {
                    setCategoryId(item.id);
                    setSelectedInstrument(null);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className={styles.live}><span /> Live</span>
          </div>
          <div
            id={`market-panel-${categoryId}`}
            role="tabpanel"
            aria-labelledby={`market-tab-${categoryId}`}
          >
            <div className={styles.periods} role="group" aria-label="Chart time range">
              {chartPeriods.map((period) => (
                <button
                  key={period.id}
                  type="button"
                  className={periodId === period.id ? styles.selectedPeriod : ""}
                  aria-pressed={periodId === period.id}
                  onClick={() => setPeriodId(period.id)}
                >
                  {period.label}
                </button>
              ))}
            </div>
            {categoryId === "crypto" ? (
              <>
                <div className={styles.instrumentButtons} role="group" aria-label="Cryptocurrency pairs">
                  {cryptoPairs.map((pair) => (
                    <button
                      key={pair.id}
                      type="button"
                      className={selectedPairId === pair.id ? styles.selectedInstrument : ""}
                      aria-pressed={selectedPairId === pair.id}
                      onClick={() => setSelectedPairId(pair.id)}
                    >
                      {pair.label}
                    </button>
                  ))}
                </div>
                <div className={styles.bitcoinQuote}>
                  <strong>{activeCoin ? priceFormatter.format(Number(activeCoin.current_price)) : "--"}</strong>
                  <span className={Number(activeCoin?.price_change_percentage_24h) >= 0 ? styles.positive : styles.negative}>
                    {activeCoin ? `${Number(activeCoin.price_change_percentage_24h) >= 0 ? "+" : ""}${Number(activeCoin.price_change_percentage_24h).toFixed(2)}%` : "--"}
                  </span>
                </div>
                <div className={styles.chartLabel}><span>{selectedPair.name} · {selectedPair.label}</span><span>{selectedPeriod.label}</span></div>
                {chartLoading
                  ? <p className={styles.chartStatus}>Loading live price history…</p>
                  : chartError
                    ? (
                      <div>
                        <p className={styles.chartStatus} role="status">
                          CoinGecko history unavailable. Showing the live TradingView chart instead.
                        </p>
                        <iframe
                          className={styles.tradingViewChart}
                          title={`${selectedPair.name} ${selectedPeriod.label} live chart`}
                          src={`https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(selectedPair.tradingViewSymbol)}&interval=${selectedPeriod.tradingViewInterval}&theme=dark&style=1&hideideas=1&locale=en`}
                          loading="lazy"
                          allow="fullscreen"
                        />
                      </div>
                    )
                    : <PriceChart
                      prices={chartPrices}
                      positive={Number(activeCoin?.price_change_percentage_24h) >= 0}
                      pairLabel={`${selectedPair.name} ${selectedPair.label}`}
                      periodLabel={selectedPeriod.label}
                    />}
              </>
            ) : (
              <section className={styles.otherMarkets} aria-label={`${category.label} live market data`}>
                <p className={styles.marketSource}>Live charts powered by TradingView</p>
                <div className={styles.instrumentButtons} aria-label={`${category.label} instruments`}>
                  {category.instruments.map(([label, symbol]) => (
                    <button
                      key={symbol}
                      type="button"
                      className={(activeInstrument?.[1] === symbol) ? styles.selectedInstrument : ""}
                      aria-pressed={activeInstrument?.[1] === symbol}
                      onClick={() => setSelectedInstrument(symbol)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {activeInstrument && (
                  <iframe
                    className={styles.tradingViewChart}
                    title={`${activeInstrument[0]} live chart`}
                    src={`https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(activeInstrument[1])}&interval=${selectedPeriod.tradingViewInterval}&theme=dark&style=1&hideideas=1&locale=en`}
                    loading="lazy"
                    allow="fullscreen"
                  />
                )}
              </section>
            )}
          </div>

          <section className={styles.challenge} id="investing-challenges">
            <div className={styles.challengeTitle}><Trophy size={18} aria-hidden="true" /><h3>Investing Challenges</h3></div>
            <p>Join a challenge and build your market knowledge.</p>
            <button type="button" onClick={onSignup}>Take the Challenge</button>
          </section>

          {categoryId === "crypto" && <section className={styles.movers} aria-labelledby="market-movers-heading">
            <div className={styles.heading}>
              <h2 id="market-movers-heading">Market Movers</h2>
              <span aria-hidden="true">›</span>
            </div>
            <div className={styles.filters} role="group" aria-label="Market mover filters">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={filter === item.id ? styles.active : ""}
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className={styles.columns} aria-hidden="true">
              <span>Name</span>
              <span>Last</span>
              <span>Chg. %</span>
              <span>Vol.</span>
            </div>

            {movers.length ? (
              <ul className={styles.list}>
                {movers.map((coin) => {
                  const change = Number(coin.price_change_percentage_24h);
                  const hasChange = Number.isFinite(change);
                  const positive = hasChange && change >= 0;

                  return (
                    <li className={styles.row} key={coin.id}>
                      <span className={styles.name} title={`${coin.name} (${coin.symbol})`}>
                        <strong>{coin.symbol?.toUpperCase()}</strong>
                        <small>{coin.name}</small>
                      </span>
                      <span className={styles.price}>
                        {Number.isFinite(Number(coin.current_price))
                          ? priceFormatter.format(Number(coin.current_price))
                          : "--"}
                      </span>
                      <span className={hasChange ? positive ? styles.positive : styles.negative : ""}>
                        {hasChange ? `${positive ? "+" : ""}${change.toFixed(2)}%` : "--"}
                      </span>
                      <span className={styles.volume}>
                        {Number.isFinite(Number(coin.total_volume))
                          ? volumeFormatter.format(Number(coin.total_volume))
                          : "--"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.empty}>
                {coins.length ? "No coins match this market view." : "Live market data is currently unavailable."}
              </p>
            )}
          </section>}
        </div>
        <nav className={styles.rail} aria-label="Market dashboard shortcuts">
          {quickLinks.map(({ label, href, Icon }) => (
            <a href={href} key={label}>
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

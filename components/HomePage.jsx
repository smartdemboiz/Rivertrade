"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import MarketTable from "@/components/MarketTable";
import LandingExtras from "@/components/LandingExtras";

const plans = [
  ["STARTER PACKAGE", "$5,000 - $9,000"],
  ["DELUXE PACKAGE", "$10,000 - $29,000"],
  ["PREMIUM PACKAGE", "$30,000 - $49,000"],
  ["VIP PACKAGE", "$100,000 - $150,000"],
  ["GOLD PACKAGE", "$200,000 - $300,000"],
  ["VIP PLATINUM", "$500,000 - $1,000,000"],
];
const testimonials = [
  [
    "Diego_1280x720_unlocalised@2x.jpg",
    "Diego Johnson",
    "I am a living witness to this company, for some years now I have been receiving my investment and my profit, this is one of the best company to invest on cryptocurrencies",
  ],
  [
    "Steven_Hatzakis _170x170.webp",
    "Steven Hatzakis",
    "Holding a Bitcoin today is like owning a Facebook, Amazon, or Apple stock positions in the early 2000's. Blockchain technology has a lot more on offer if you could just adopt it. I will always advise people to invest in this company.",
  ],
  [
    "joey_Shadeck.webp",
    "Joey Shadeck",
    "Bitcoin is up 60% on the year while the almighty GOLD is down by 11%, and yet still hate investing in BTC for the long run? Math doesn't lie, the media does",
  ],
  [
    "private-client-man-08e033759930e9900a5601ce2556abc2.jpg",
    "Jim Cramer",
    "Anything the government hates or ban, invest in it and spend time to understand it better. That could be your missing piece. Bitcoin is a perfect example of such! I am always grateful to this amazing company for being the best.",
  ],
  [
    "preston-d819514ab2aff1f63db2c5dc7fdfa1ce.jpg",
    "Preston Pysh",
    "In the next 5-10 years, digital assets (predominantly Bitcoin and few Alts) will prove to be a strong alternative currency of the world, if not entirely dethrone fiat currency. this is one of the Forex trading company.",
  ],
  [
    "b9f89f516a2fe649a582c2a79c68b54e.jpg",
    "Dayan Du Dosson",
    "Great platform to invest your money. I advice you use this",
  ],
  [
    "laura-irish-faeb36fb050b50c4bd65b672f95f4c70.jpg",
    "Laura Irish",
    "This website is so great. Now I have my own business. I'm really happy. I will trading under your website",
  ],
  [
    "hoffmeister-greg-dbb0c75423763eb27975341e8241c094.jpg",
    "Greg Hoffmeister",
    "All you just need to do is invest and let them do their work after making withdrawal you pay their for a job well done. They has never made loss on part so please y'all can reach out to this platform",
  ],
  [
    "John-Bringans.webp",
    "John Bringans",
    "I'm still shocked. I never believed I can ever make profit from trading after all the lost but never gave up",
  ],
  [
    "photo_2025-10-26_13-43-04.jpg",
    "Jasmine Marcus",
    "Wow, what a surprise, did I just got my withdrawal? Is this real or a joke, I can't believe this. thank you very much is amazing",
  ],
  [
    "dom-bei-7f0538aa8d3877270b84661f5e87a0ad.jpg",
    "Bei Wilson",
    "You all are the best, and am looking forward to trade with this platform all again. Feel free to tell others of your investment and withdrawals.",
  ],
  [
    "6a13ca5cb7536acada3f32ee1d5783de.jpg",
    "Patricia Feghhi-Levine",
    "Just a quick thanks for your website!! You are a worthwhile mentor. I think there are thousands who truly appreciate what you are doing!",
  ],
];

export default function Home() {
  const [btc, setBtc] = useState(1);
  const [currency, setCurrency] = useState("usd");
  const [price, setPrice] = useState(0);
  const testimonialTrackRef = useRef(null);
  const [marketStats, setMarketStats] = useState({
    marketCap: "$2.62T",
    volume: "$89.51B",
    btcDominance: "58.82%",
    ethDominance: "11.50%",
  });
  useEffect(() => {
    fetch("/api/bitcoin-price")
      .then((r) => r.json())
      .then((data) => setPrice(data[currency] || 0))
      .catch(() => setPrice(104283));
  }, [currency]);
  useEffect(() => {
    const refreshMarketStats = () => {
      fetch("/api/market")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          const formatTrillions = (value) =>
            value >= 1e12 ? `$${(value / 1e12).toFixed(2)}T` : `$${(value / 1e9).toFixed(2)}B`;
          setMarketStats({
            marketCap: formatTrillions(data.marketCap),
            volume: formatTrillions(data.volume),
            btcDominance: `${data.btcDominance.toFixed(2)}%`,
            ethDominance: `${data.ethDominance.toFixed(2)}%`,
          });
        })
        .catch(() => {});
    };

    refreshMarketStats();
    const interval = window.setInterval(refreshMarketStats, 60000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    const track = testimonialTrackRef.current;
    if (!track) return undefined;
    let offset = 0;
    let previousTime;
    let frame;

    const animate = (time) => {
      if (previousTime === undefined) previousTime = time;
      offset += (time - previousTime) * 0.03;
      previousTime = time;

      const loopWidth = track.scrollWidth / 2;
      if (loopWidth > 0 && offset >= loopWidth) offset -= loopWidth;
      track.style.transform = `translate3d(-${offset}px, 0, 0)`;
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return (
    <>
      <SiteHeader landing />
      <main className="legacy-home">
        <section className="hero-banner">
          <img
            src="/crypt-icon/ee9293217b1dcec8bd29b5e90013e91901634793-3083x1464.png"
            alt="Cryptocurrency market overview"
          />
        </section>
        <section className="legacy-stats">
          <article>
            <h3>Market Cap</h3>
            <strong>{marketStats.marketCap}</strong>
          </article>
          <article>
            <h3>Volume</h3>
            <strong>{marketStats.volume}</strong>
          </article>
          <article>
            <h3>BTC Dominance</h3>
            <strong>{marketStats.btcDominance}</strong>
          </article>
          <article>
            <h3>ETH Dominance</h3>
            <strong>{marketStats.ethDominance}</strong>
          </article>
        </section>
        <section className="legacy-market">
          <div className="legacy-heading">
            <div>
              <span>LIVE MARKET</span>
              <h2>Crypto Market Overview</h2>
            </div>
            <p>Track the market in real time and find your next opportunity.</p>
          </div>
          <MarketTable />
        </section>
        <section className="feature-advanced-trader">
          <div>
            <span>POWERFUL TOOLS</span>
            <h2>Features for advanced traders</h2>
            <p>
              Utilize a suite of tools designed for deep technical analysis,
              custom price alerts, advanced order types, and ladder trading.
            </p>
          </div>
          <img
            src="/crypt-icon/6eed12ecb89bee4eb23ddc692a354f34400f0f62-2531x1300.png"
            alt="Features for advanced traders"
          />
        </section>
        <section className="packages1">
          <div className="legacy-heading centered">
            <span>INVESTMENT PLANS</span>
            <h2>Choose your perfect plan</h2>
            <p>
              Choose the perfect investment plan that suits your trading goals
              and financial objectives.
            </p>
          </div>
          <div className="packages">
            {plans.map(([name, range]) => (
              <article className="legacy-plan" key={name}>
                <h3>{name}</h3>
                <span>FOR</span>
                <strong>{range}</strong>
                <Link href="/auth?mode=register">Get Started</Link>
              </article>
            ))}
          </div>
        </section>
        <section className="bitcoin-calculator-section">
          <div className="legacy-heading centered">
            <span>BITCOIN CALCULATOR</span>
            <h2>Know your Bitcoin value</h2>
            <p>
              Find out the current Bitcoin value with our easy-to-use converter.
            </p>
          </div>
          <div className="bitcoin-calculator">
            <input
              type="number"
              value={btc}
              min="0"
              step="any"
              onChange={(e) => setBtc(e.target.value)}
            />
            <img
              src="/Icons/gold-currency-btc-8f457ad7cc5c1925d315031c6375a0d4.svg"
              alt="Bitcoin"
            />
            <b>=</b>
            <output>
              {(Number(btc) * price).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </output>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
              <option value="cad">CAD</option>
              <option value="jpy">JPY</option>
            </select>
          </div>
          <small>* Data updated from live market pricing</small>
        </section>
        <section className="call-action-all">
          <div>
            <span>RIVERTRADE</span>
            <h2>Secure &amp; Fast Transactions</h2>
            <p>Open an account for free and start investing with confidence.</p>
            <Link href="/auth?mode=register">Get started</Link>
          </div>
        </section>
        <section className="Customertestimonials">
          <div className="legacy-heading centered">
            <span>CLIENT STORIES</span>
            <h2>Trusted by people moving forward</h2>
          </div>
          <div className="testimonialtrack" ref={testimonialTrackRef}>
            {testimonials.concat(testimonials).map(([image, name, quote], index) => (
              <article className="customertext" key={`${name}-${index}`}>
                <img src={`/Image/${image}`} alt={name} />
                <p>{quote}</p>
                <strong>{name}</strong>
                <div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
              </article>
            ))}
          </div>
        </section>
        <LandingExtras />
      </main>
    </>
  );
  return (
    <>
      <SiteHeader landing />
      <main className="legacy-home">
        <section className="hero-banner">
          <img
            src="/crypt-icon/ee9293217b1dcec8bd29b5e90013e91901634793-3083x1464.png"
            alt="Cryptocurrency market overview"
          />
        </section>
        <section className="legacy-stats">
          <article>
            <h3>Market Cap</h3>
            <strong>$3.42T</strong>
          </article>
          <article>
            <h3>Volume</h3>
            <strong>$128.6B</strong>
          </article>
          <article>
            <h3>BTC Dominance</h3>
            <strong>56.72%</strong>
          </article>
          <article>
            <h3>ETH Dominance</h3>
            <strong>17.45%</strong>
          </article>
        </section>
        <section className="legacy-market">
          <div className="legacy-heading">
            <div>
              <span>LIVE MARKET</span>
              <h2>Crypto Market Overview</h2>
            </div>
            <p>Track the market in real time and find your next opportunity.</p>
          </div>
          <MarketTable />
        </section>
        <section className="feature-advanced-trader">
          <div>
            <span>POWERFUL TOOLS</span>
            <h2>Features for advanced traders</h2>
            <p>
              Utilize a suite of tools designed for deep technical analysis,
              custom price alerts, advanced order types, and ladder trading.
            </p>
          </div>
          <img
            src="/crypt-icon/6eed12ecb89bee4eb23ddc692a354f34400f0f62-2531x1300.png"
            alt="Features for advanced traders"
          />
        </section>
        <section className="packages1">
          <div className="legacy-heading centered">
            <span>INVESTMENT PLANS</span>
            <h2>Choose your perfect plan</h2>
            <p>
              Choose the perfect investment plan that suits your trading goals
              and financial objectives.
            </p>
          </div>
          <div className="packages">
            {plans.map(([name, range]) => (
              <article className="legacy-plan" key={name}>
                <h3>{name}</h3>
                <span>FOR</span>
                <strong>{range}</strong>
                <Link href="/auth?mode=register">Get Started</Link>
              </article>
            ))}
          </div>
        </section>
        <section className="bitcoin-calculator-section">
          <div className="legacy-heading centered">
            <span>BITCOIN CALCULATOR</span>
            <h2>Know your Bitcoin value</h2>
            <p>
              Find out the current Bitcoin value with our easy-to-use converter.
            </p>
          </div>
          <div className="bitcoin-calculator">
            <input
              type="number"
              value={btc}
              min="0"
              step="any"
              onChange={(e) => setBtc(e.target.value)}
            />
            <img
              src="/Icons/gold-currency-btc-8f457ad7cc5c1925d315031c6375a0d4.svg"
              alt="Bitcoin"
            />
            <b>=</b>
            <output>
              {(Number(btc) * price).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </output>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
              <option value="cad">CAD</option>
              <option value="jpy">JPY</option>
            </select>
          </div>
          <small>* Data updated from live market pricing</small>
        </section>
        <section className="call-action-all">
          <div>
            <span>RIVERTRADE</span>
            <h2>Secure &amp; Fast Transactions</h2>
            <p>Open an account for free and start investing with confidence.</p>
            <Link href="/auth?mode=register">Get started</Link>
          </div>
        </section>
        <section className="Customertestimonials">
          <div className="legacy-heading centered">
            <span>CLIENT STORIES</span>
            <h2>Trusted by people moving forward</h2>
          </div>
          <div className="testimonialtrack">
            {testimonials.map(([image, name, quote]) => (
              <article className="customertext" key={name}>
                <img src={`/Image/${image}`} alt={name} />
                <p>{quote}</p>
                <strong>{name}</strong>
                <div className="stars">★★★★★</div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

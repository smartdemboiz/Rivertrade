"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

const assets = ["BTC", "ETH", "USDT", "BNB", "XRP", "DOGE"];
const balances = { BTC: "0", ETH: "0", USDT: "0", BNB: "0", XRP: "0", DOGE: "0" };

export default function DashboardSwapCrypto() {
  const [fromAsset, setFromAsset] = useState("Available Balance");
  const [toAsset, setToAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [swapped, setSwapped] = useState(false);

  const swapDirections = () => {
    const nextFrom = toAsset;
    setToAsset(fromAsset === "Available Balance" ? "BTC" : fromAsset);
    setFromAsset(nextFrom);
    setSwapped(false);
  };

  const executeSwap = (event) => {
    event.preventDefault();
    if (amount && fromAsset !== toAsset) setSwapped(true);
  };

  return (
    <section className="dashboard-swap" aria-labelledby="swap-title">
      <h2 id="swap-title">Swap Crypto</h2>
      <h3>Your Balances</h3>
      <div className="dashboard-swap-balances">
        <div className="dashboard-swap-available"><span>Available<br />Balance</span><strong>$0.00</strong></div>
        {assets.map((asset) => <span key={asset}>{asset} {balances[asset]}</span>)}
      </div>

      <form onSubmit={executeSwap}>
        <div className="dashboard-swap-pair">
          <label>From<select value={fromAsset} onChange={(event) => { setFromAsset(event.target.value); setSwapped(false); }}><option>Available Balance</option>{assets.map((asset) => <option key={asset}>{asset}</option>)}</select></label>
          <button className="dashboard-swap-switch" type="button" onClick={swapDirections} aria-label="Swap source and destination"><ArrowLeftRight size={20} /></button>
          <label>To<select value={toAsset} onChange={(event) => { setToAsset(event.target.value); setSwapped(false); }}>{assets.map((asset) => <option key={asset}>{asset}</option>)}</select></label>
        </div>
        <label className="dashboard-swap-amount">Amount to Swap<input type="number" min="0" step="any" value={amount} onChange={(event) => { setAmount(event.target.value); setSwapped(false); }} placeholder="Enter amount" required /></label>
        <p className="dashboard-swap-preview">{swapped ? "Swap request submitted for review." : amount && fromAsset !== toAsset ? `You are ready to swap ${amount} ${fromAsset} for ${toAsset}.` : "Enter an amount and select two different sources to preview the swap."}</p>
        <button className="dashboard-swap-submit" type="submit">Execute Swap</button>
      </form>

      <div className="dashboard-recent-swaps"><h3>Recent Swaps</h3><p>No swaps yet</p></div>
    </section>
  );
}

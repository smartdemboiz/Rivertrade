"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarDays, CircleHelp, ShieldCheck, TrendingUp, Wallet } from "lucide-react";

const allocation = [
  ["Bitcoin", "42%", "#f2683a"],
  ["Ethereum", "28%", "#91d6cf"],
  ["Stablecoins", "20%", "#c7e35e"],
  ["Other assets", "10%", "#aaa"],
];

export default function DashboardManagedAccount() {
  const [riskProfile, setRiskProfile] = useState("Balanced");
  const [requestSent, setRequestSent] = useState(false);

  return (
    <section className="dashboard-managed-account" aria-labelledby="managed-account-title">
      <div className="managed-account-heading">
        <div>
          <p className="eyebrow">Portfolio management</p>
          <h2 id="managed-account-title">Managed Account</h2>
          <p>Let our investment team manage your portfolio according to your goals and risk profile.</p>
        </div>
        <span className="managed-account-status"><ShieldCheck size={16} /> Active</span>
      </div>

      <div className="managed-account-summary">
        <article><span>Account value</span><strong>$0.00</strong><small>Current managed balance</small></article>
        <article><span>Total return</span><strong className="positive">+$0.00</strong><small>Since account opening</small></article>
        <article><span>Monthly return</span><strong className="positive">0.00%</strong><small>Current month</small></article>
        <article><span>Management fee</span><strong>1.5%</strong><small>Annual management fee</small></article>
      </div>

      <div className="managed-account-grid">
        <section className="managed-account-panel managed-account-manager">
          <div className="managed-account-panel-heading"><h3>Account manager</h3><button type="button" aria-label="Contact account manager"><CircleHelp size={18} /></button></div>
          <div className="managed-account-manager-profile"><div className="managed-account-avatar">RT</div><div><strong>RiverTrade Investment Team</strong><span>Professional portfolio management</span></div></div>
          <div className="managed-account-detail"><span>Strategy</span><strong>Balanced Growth</strong></div>
          <div className="managed-account-detail"><span>Next review</span><strong><CalendarDays size={15} /> October 1, 2026</strong></div>
          <button className="managed-account-outline-button" type="button" onClick={() => setRequestSent(true)}>{requestSent ? "Request sent" : "Request a portfolio review"}</button>
          {requestSent && <small className="managed-account-success" role="status">Your review request was sent to the investment team.</small>}
        </section>

        <section className="managed-account-panel">
          <div className="managed-account-panel-heading"><h3>Portfolio allocation</h3><Wallet size={18} /></div>
          <div className="managed-account-allocation-chart" />
          <div className="managed-account-legend">{allocation.map(([name, percentage, color]) => <span key={name}><i style={{ background: color }} />{name}<strong>{percentage}</strong></span>)}</div>
        </section>
      </div>

      <section className="managed-account-preferences">
        <div><h3>Investment preferences</h3><p>Your preferences help our team keep your portfolio aligned with your goals.</p></div>
        <label>Risk profile<select value={riskProfile} onChange={(event) => setRiskProfile(event.target.value)}><option>Conservative</option><option>Balanced</option><option>Aggressive</option></select></label>
        <button type="button" className="managed-account-primary-button"><TrendingUp size={16} /> Add funds to managed account <ArrowUpRight size={16} /></button>
      </section>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, CircleHelp, ShieldCheck, TrendingUp, Wallet } from "lucide-react";

const riskProfiles = ["Conservative", "Balanced", "Aggressive"];
const authHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function formatCurrency(amount, currency = "USD") {
  if (["BTC", "ETH", "USDT", "BNB", "XRP", "DOGE", "SOL"].includes(currency)) {
    return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 8 }).format(Number(amount) || 0)} ${currency}`;
  }
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export default function DashboardManagedAccount({ onStartFunding }) {
  const [account, setAccount] = useState(null);
  const [fundingRequests, setFundingRequests] = useState([]);
  const [riskProfile, setRiskProfile] = useState("Balanced");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingRisk, setSavingRisk] = useState(false);
  const [sendingReview, setSendingReview] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAccount = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/account/managed-account", {
        headers: authHeaders(),
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load your managed account.");
      setAccount(body.data || null);
      setFundingRequests(body.fundingRequests || []);
      setRiskProfile(body.data?.risk_profile || "Balanced");
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Unable to load your managed account.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadAccount(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAccount]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadAccount();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => document.removeEventListener("visibilitychange", refreshWhenVisible);
  }, [loadAccount]);

  async function submitAction(action, selectedRiskProfile) {
    setSaving(true);
    if (action === "preferences") setSavingRisk(true);
    if (action === "review") setSendingReview(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/account/managed-account", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ action, riskProfile: selectedRiskProfile }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to update your managed account.");
      setAccount(body.data);
      setRiskProfile(body.data.risk_profile || "Balanced");
      setNotice(action === "setup"
        ? "Your setup request was sent. The investment team must activate your account before it can receive funds."
        : action === "review"
          ? "Your portfolio review request was sent to the investment team."
          : "Your risk profile has been saved.");
      await loadAccount();
    } catch (actionError) {
      setError(actionError.message || "Unable to update your managed account.");
    } finally {
      setSaving(false);
      if (action === "preferences") setSavingRisk(false);
      if (action === "review") setSendingReview(false);
    }
  }

  const isActive = account?.status === "active";
  const statusLabel = account ? String(account.status || "review") : "Not set up";
  const currency = account?.account_currency || "USD";
  const totalReturn = account?.total_return === null || account?.total_return === undefined
    ? null
    : Number(account.total_return);

  return (
    <section className="dashboard-managed-account" aria-labelledby="managed-account-title">
      <div className="managed-account-heading">
        <div>
          <p className="eyebrow">Portfolio management</p>
          <h2 id="managed-account-title">Managed Account</h2>
          <p>View your managed account details and send requests to the investment team.</p>
        </div>
        <span className="managed-account-status"><ShieldCheck size={16} /> {loading ? "Loading" : statusLabel}</span>
      </div>

      {error && <p className="dashboard-deposit-error" role="alert">{error}</p>}
      {notice && <p className="managed-account-success" role="status">{notice}</p>}

      {loading ? <p role="status">Loading managed account…</p> : !account ? (
        <section className="managed-account-panel">
          <h3>Set up a managed account</h3>
          <p>The investment team must review and activate your account before it can receive funding.</p>
          <button className="managed-account-primary-button" type="button" disabled={saving} onClick={() => submitAction("setup")}>
            {saving ? "Sending request…" : "Request account setup"} <ArrowUpRight size={16} />
          </button>
        </section>
      ) : <>
        <div className="managed-account-summary">
          <article><span>Account value</span><strong>{formatCurrency(account.account_value, currency)}</strong></article>
          <article><span>Total return</span><strong className={totalReturn !== null && totalReturn >= 0 ? "positive" : ""}>{totalReturn === null ? "—" : `${totalReturn > 0 ? "+" : ""}${formatCurrency(totalReturn, currency)}`}</strong></article>
          <article><span>Monthly return</span><strong className={account.monthly_return !== null && account.monthly_return !== undefined ? "positive" : ""}>{account.monthly_return === null || account.monthly_return === undefined ? "—" : `${Number(account.monthly_return).toFixed(2)}%`}</strong></article>
          <article><span>Management fee</span><strong>{account.management_fee === null ? "—" : `${Number(account.management_fee).toFixed(2)}%`}</strong></article>
        </div>

        <div className="managed-account-grid">
          <section className="managed-account-panel managed-account-manager">
            <div className="managed-account-panel-heading"><h3>Account manager</h3><CircleHelp size={18} /></div>
            <div className="managed-account-manager-profile"><div className="managed-account-avatar">RT</div><div><strong>RiverTrade Investment Team</strong><span>{account.strategy || "Strategy pending assignment"}</span></div></div>
            <div className="managed-account-detail"><span>Allocation</span><strong>{account.allocation || "Not configured"}</strong></div>
            <div className="managed-account-detail"><span>Next review</span><strong><CalendarDays size={15} /> {account.next_review_at ? new Date(`${account.next_review_at}T00:00:00`).toLocaleDateString() : "Not scheduled"}</strong></div>
            <button
              className="managed-account-outline-button"
              type="button"
              disabled={!isActive || saving || Boolean(account.review_requested_at)}
              onClick={() => submitAction("review")}
            >
              {account.review_requested_at ? "Review requested" : sendingReview ? "Sending request…" : "Request a portfolio review"}
            </button>
            {!isActive && <small>Your account must be activated before review or funding requests can be made.</small>}
          </section>

          <section className="managed-account-panel">
            <div className="managed-account-panel-heading"><h3>Managed-account funding</h3><Wallet size={18} /></div>
            <p>Funding requests are reviewed by the investment team. Funds are assigned to this account only after confirmation.</p>
            {isActive && <button type="button" className="managed-account-primary-button" onClick={onStartFunding}>
              <TrendingUp size={16} /> Add funds to managed account <ArrowUpRight size={16} />
            </button>}
            {fundingRequests.length > 0 && <div className="managed-account-funding-list">
              <strong>Funding requests</strong>
              {fundingRequests.map(item => (
                <div className="managed-account-detail" key={item.id}>
                  <span>{new Date(item.created_at).toLocaleDateString()} · {item.method}</span>
                  <strong>{item.status === "confirmed"
                    ? formatCurrency(item.credited_amount, item.credited_currency)
                    : `${item.amount} ${item.currency}`} · {item.status}</strong>
                </div>
              ))}
            </div>}
          </section>
        </div>

        <section className="managed-account-preferences">
          <div><h3>Investment preferences</h3><p>Choose a risk profile for the investment team to consider.</p></div>
          <label>Risk profile
            <select value={riskProfile} onChange={(event) => setRiskProfile(event.target.value)} disabled={saving}>
              {riskProfiles.map(profile => <option key={profile}>{profile}</option>)}
            </select>
          </label>
          <button
            type="button"
            className="managed-account-primary-button"
            disabled={saving || !account || riskProfile === account.risk_profile}
            onClick={() => submitAction("preferences", riskProfile)}
          >
            {savingRisk ? "Saving…" : "Save preferences"}
          </button>
        </section>
      </>}
    </section>
  );
}

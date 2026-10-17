"use client";

import { useEffect, useMemo, useState } from "react";

const supportedCurrencies = new Set(["USD", "BTC", "ETH", "USDT", "BNB", "XRP", "DOGE"]);

const formatUsd = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
}).format(Number(value) || 0);

function formatAsset(value, currency) {
  const decimals = currency === "USD" ? 2 : currency === "USDT" || currency === "XRP" ? 6 : 8;
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(Number(value) || 0)} ${currency}`;
}

function authHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function DashboardInvestmentPlans() {
  const [plans, setPlans] = useState([]);
  const [availableBalances, setAvailableBalances] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [fundingCurrency, setFundingCurrency] = useState("");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteRefresh, setQuoteRefresh] = useState(0);
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastInvestment, setLastInvestment] = useState(null);
  const [now, setNow] = useState(0);

  async function fetchOptions() {
    const response = await fetch("/api/account/investments", {
      headers: authHeaders(),
      cache: "no-store",
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Unable to load investment plans and balances.");
    return body;
  }

  async function refreshOptions() {
    setLoading(true);
    try {
      const body = await fetchOptions();
      setPlans(body.plans || []);
      setAvailableBalances(body.availableBalances || []);
      setPageError("");
    } catch (error) {
      setPageError(error.message || "Unable to load investment options.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetchOptions()
      .then(body => {
        if (cancelled) return;
        setPlans(body.plans || []);
        setAvailableBalances(body.availableBalances || []);
        setPageError("");
      })
      .catch(error => {
        if (!cancelled) setPageError(error.message || "Unable to load investment options.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedPlan || !fundingCurrency || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setQuoteLoading(true);
      setQuote(null);
      setQuoteError("");
      try {
        const response = await fetch("/api/account/investments", {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "quote",
            planId: selectedPlan.id,
            amountUsd: amount,
            currency: fundingCurrency,
          }),
          cache: "no-store",
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to get a live conversion quote.");
        if (!cancelled) setQuote(body.quote);
      } catch (error) {
        if (!cancelled) setQuoteError(error.message || "Unable to get a live conversion quote.");
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedPlan, fundingCurrency, amount, quoteRefresh]);

  useEffect(() => {
    if (!quote) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [quote]);

  const supportedBalances = useMemo(
    () => availableBalances.filter(balance => supportedCurrencies.has(balance.currency) && balance.amount > 0),
    [availableBalances],
  );
  const sourceBalance = supportedBalances.find(balance => balance.currency === fundingCurrency)?.amount || 0;
  const numericAmount = Number(amount) || 0;
  const planMinimum = selectedPlan?.minimum ?? 0;
  const planMaximum = selectedPlan?.maximum ?? 0;
  const projectedReturn = selectedPlan ? numericAmount * selectedPlan.roi / 100 : 0;
  const isWithinPlanRange = Boolean(selectedPlan)
    && numericAmount >= planMinimum
    && (selectedPlan.maximum === null || numericAmount <= planMaximum);
  const quoteExpired = !quote || Date.parse(quote.expires_at) <= now;
  const quoteSecondsLeft = quote ? Math.max(0, Math.ceil((Date.parse(quote.expires_at) - now) / 1000)) : 0;
  const quoteMatches = quote
    && Number(quote.amount_usd) === numericAmount
    && quote.funding_currency === fundingCurrency;
  const isReadyToSubmit = Boolean(
    selectedPlan
    && fundingCurrency
    && isWithinPlanRange
    && quoteMatches
    && !quoteExpired
    && Number(quote.funding_amount) <= sourceBalance
    && !quoteLoading
    && !submitting,
  );

  const openPlan = (plan) => {
    setSelectedPlan(plan);
    setFundingCurrency(supportedBalances[0]?.currency || "");
    setAmount("");
    setQuote(null);
    setQuoteError("");
    setQuoteLoading(false);
    setQuoteRefresh(0);
    setPageError("");
  };

  const closePlan = () => {
    setSelectedPlan(null);
    setQuote(null);
    setQuoteError("");
  };

  async function submitInvestment(event) {
    event.preventDefault();
    if (!isReadyToSubmit) return;

    setSubmitting(true);
    setPageError("");
    try {
      const response = await fetch("/api/account/investments", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", quoteId: quote.id }),
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to submit this investment.");

      setLastInvestment({
        plan: selectedPlan.name,
        amount: numericAmount,
        fundingAmount: quote.funding_amount,
        fundingCurrency,
        exchangeRateUsd: quote.exchange_rate_usd,
        roi: selectedPlan.roi,
        durationDays: selectedPlan.durationDays,
      });
      closePlan();
      await refreshOptions();
    } catch (error) {
      setPageError(error.message || "Unable to submit this investment.");
      if (/expired|already been used|no longer active|insufficient/i.test(error.message || "")) {
        setQuote(null);
        setQuoteError(error.message || "Request a fresh quote before confirming.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="dashboard-investment-plans" aria-labelledby="investment-plans-title">
      <h2 id="investment-plans-title">Investment Plans</h2>
      {pageError && <p className="dashboard-deposit-error" role="alert">{pageError}</p>}
      {loading ? (
        <p className="dashboard-investment-empty-state">Loading plans and available balances…</p>
      ) : plans.length ? (
        <div className="dashboard-plan-grid">
          {plans.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            return (
              <article className={`dashboard-plan-card${isSelected ? " dashboard-plan-card--selected" : ""}`} key={plan.id}>
                <span className="dashboard-plan-badge">{plan.roi}% ROI</span>
                <h3>{plan.name}</h3>
                <p>Min: {formatUsd(plan.minimum)}</p>
                <p>Max: {plan.maximum === null ? "No maximum" : formatUsd(plan.maximum)}</p>
                <p>Duration: {plan.durationDays} days</p>
                <button type="button" onClick={() => openPlan(plan)}>Invest Now</button>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="dashboard-investment-empty-state">No active investment plans are available right now.</p>
      )}

      {selectedPlan && (
        <div className="dashboard-investment-modal-overlay">
          <div className="dashboard-investment-modal" role="dialog" aria-modal="true" aria-labelledby="investment-modal-title">
            <div className="dashboard-investment-header">
              <div>
                <span className="dashboard-investment-kicker">Selected plan</span>
                <h3 id="investment-modal-title">Invest in {selectedPlan.name}</h3>
              </div>
              <button type="button" className="dashboard-investment-close" onClick={closePlan} aria-label="Close investment dialog">
                ×
              </button>
            </div>

            <form className="dashboard-investment-form" onSubmit={submitInvestment}>
              <div className="dashboard-investment-meta">
                <div>
                  <span>ROI</span>
                  <strong>{selectedPlan.roi}%</strong>
                </div>
                <div>
                  <span>Term</span>
                  <strong>{selectedPlan.durationDays} days</strong>
                </div>
                <div>
                  <span>Range (USD)</span>
                  <strong>{formatUsd(planMinimum)} – {selectedPlan.maximum === null ? "No maximum" : formatUsd(planMaximum)}</strong>
                </div>
              </div>

              <label htmlFor="investment-funding-source">Pay using available balance</label>
              {supportedBalances.length ? (
                <select
                  id="investment-funding-source"
                  value={fundingCurrency}
                  onChange={(event) => {
                    setFundingCurrency(event.target.value);
                    setQuote(null);
                    setQuoteError("");
                    setQuoteLoading(Number(amount) > 0);
                  }}
                >
                  {supportedBalances.map((source) => (
                    <option key={source.currency} value={source.currency}>
                      {source.currency} · {formatAsset(source.amount, source.currency)}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="dashboard-investment-empty-state">
                  No available USD or supported crypto balance found. Confirmed deposits will appear here after they are credited.
                </div>
              )}

              <div className="dashboard-investment-balance">
                <span>Available {fundingCurrency || "balance"}</span>
                <strong>{fundingCurrency ? formatAsset(sourceBalance, fundingCurrency) : "—"}</strong>
              </div>

              <label htmlFor="investment-amount">Investment amount (USD)</label>
              <input
                id="investment-amount"
                type="number"
                min={planMinimum}
                max={selectedPlan.maximum ?? undefined}
                step="0.01"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setQuote(null);
                  setQuoteError("");
                  setQuoteLoading(Number(event.target.value) > 0);
                }}
                required
              />

              <div className="dashboard-investment-validation" aria-live="polite">
                {!numericAmount && <small>Enter an amount in USD to continue.</small>}
                {numericAmount > 0 && !isWithinPlanRange && (
                  <small>Investment must be between {formatUsd(planMinimum)} and {selectedPlan.maximum === null ? "the plan maximum" : formatUsd(planMaximum)}.</small>
                )}
                {numericAmount > 0 && isWithinPlanRange && quoteLoading && <small>Getting a live conversion quote…</small>}
                {numericAmount > 0 && quoteError && <small role="alert">{quoteError}</small>}
                {numericAmount > 0 && isWithinPlanRange && quoteMatches && !quoteExpired && (
                  <>
                    <small>Live rate: 1 {fundingCurrency} = {formatUsd(quote.exchange_rate_usd)}. Estimated debit: {formatAsset(quote.funding_amount, fundingCurrency)} for {formatUsd(numericAmount)}.</small>
                    <small>This quote expires in {quoteSecondsLeft} seconds. Conversion is for investment accounting; it does not execute an on-chain swap.</small>
                    {Number(quote.funding_amount) > sourceBalance && <small>Available {fundingCurrency} balance is insufficient for this investment.</small>}
                    {Number(quote.funding_amount) <= sourceBalance && <small>Projected return: {formatUsd(projectedReturn)} over {selectedPlan.durationDays} days at the stated plan ROI.</small>}
                  </>
                )}
                {quote && quoteExpired && <small>Quote expired. Request a fresh rate before confirming.</small>}
                {!quoteLoading && (!quote || quoteExpired) && selectedPlan && fundingCurrency && numericAmount > 0 && isWithinPlanRange && (
                  <button type="button" className="text-link" onClick={() => { setQuoteError(""); setQuoteLoading(true); setQuoteRefresh(value => value + 1); }}>
                    Refresh live quote
                  </button>
                )}
              </div>

              <div className="dashboard-investment-actions">
                <button type="button" className="dashboard-investment-cancel" onClick={closePlan}>Cancel</button>
                <button type="submit" className="dashboard-investment-submit" disabled={!isReadyToSubmit}>
                  {submitting ? "Submitting…" : "Confirm investment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lastInvestment && (
        <div className="dashboard-plan-summary" role="status">
          <h3>Investment request submitted</h3>
          <p>{formatUsd(lastInvestment.amount)} allocated to {lastInvestment.plan}. Debited {formatAsset(lastInvestment.fundingAmount, lastInvestment.fundingCurrency)} at {formatUsd(lastInvestment.exchangeRateUsd)} per {lastInvestment.fundingCurrency}.</p>
          <p>Your balance is reserved while this investment is pending admin approval. If it is cancelled before activation, the reserved crypto amount is returned.</p>
        </div>
      )}
    </section>
  );
}

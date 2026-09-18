"use client";

import { useMemo, useState } from "react";

const plans = [
  { name: "Starter Plan", minimum: 5000, maximum: 9000, duration: "45 days", roi: "6%", description: "Build momentum with a balanced short-term approach." },
  { name: "Deluxe Plan", minimum: 10000, maximum: 29000, duration: "60 days", roi: "8%", description: "A stronger mid-tier option for steady growth." },
  { name: "Premium Plan", minimum: 30000, maximum: 49000, duration: "90 days", roi: "12%", description: "A premium plan designed for faster wealth accumulation." },
  { name: "VIP Plan", minimum: 100000, maximum: 150000, duration: "120 days", roi: "18%", description: "Higher returns with a larger capital footprint." },
  { name: "Gold Plan", minimum: 200000, maximum: 300000, duration: "150 days", roi: "22%", description: "Enterprise-level performance for long-term gains." },
  { name: "VIP Platinum", minimum: 500000, maximum: 1000000, duration: "180 days", roi: "30%", description: "A premium wealth-building plan with maximum upside." },
];

const fundingSources = [];

const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}).format(value);

export default function DashboardInvestmentPlans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [fundingSource, setFundingSource] = useState("");
  const [amount, setAmount] = useState("");
  const [lastInvestment, setLastInvestment] = useState(null);

  const sourceBalance = useMemo(() => {
    const source = fundingSources.find((item) => item.name === fundingSource);
    return source?.balance ?? 0;
  }, [fundingSource]);

  const numericAmount = Number(amount) || 0;
  const planMinimum = selectedPlan?.minimum ?? 0;
  const planMaximum = selectedPlan?.maximum ?? 0;
  const projectedReturn = selectedPlan ? numericAmount * (Number.parseFloat(selectedPlan.roi) / 100) : 0;
  const isWithinPlanRange = numericAmount >= planMinimum && numericAmount <= planMaximum;
  const isSufficientBalance = sourceBalance === 0 ? false : numericAmount <= sourceBalance;
  const hasFundingSources = fundingSources.length > 0;
  const isReadyToSubmit = Boolean(selectedPlan) && hasFundingSources && isWithinPlanRange && isSufficientBalance && numericAmount > 0;

  const openPlan = (plan) => {
    setSelectedPlan(plan);
    setFundingSource("");
    setAmount("");
  };

  const submitInvestment = (event) => {
    event.preventDefault();

    if (!isReadyToSubmit) {
      return;
    }

    setLastInvestment({
      plan: selectedPlan.name,
      amount: numericAmount,
      fundingSource,
      roi: selectedPlan.roi,
      duration: selectedPlan.duration,
      projectedReturn,
    });
    setSelectedPlan(null);
  };

  return (
    <section className="dashboard-investment-plans" aria-labelledby="investment-plans-title">
      <h2 id="investment-plans-title">Investment Plans</h2>

      <div className="dashboard-plan-grid">
        {plans.map((plan) => {
          const isSelected = selectedPlan?.name === plan.name;

          return (
            <article className={`dashboard-plan-card${isSelected ? " dashboard-plan-card--selected" : ""}`} key={plan.name}>
              <span className="dashboard-plan-badge">{plan.roi} ROI</span>
              <h3>{plan.name}</h3>
              <p>Min: {formatCurrency(plan.minimum)}</p>
              <p>Max: {formatCurrency(plan.maximum)}</p>
              <p>Duration: {plan.duration}</p>
              <p>{plan.description}</p>
              <button type="button" onClick={() => openPlan(plan)}>Invest Now</button>
            </article>
          );
        })}
      </div>

      {selectedPlan && (
        <div className="dashboard-investment-modal-overlay">
          <div className="dashboard-investment-modal" role="dialog" aria-modal="true" aria-labelledby="investment-modal-title">
            <div className="dashboard-investment-header">
              <div>
                <span className="dashboard-investment-kicker">Selected plan</span>
                <h3 id="investment-modal-title">Invest in {selectedPlan.name}</h3>
              </div>
              <button type="button" className="dashboard-investment-close" onClick={() => setSelectedPlan(null)} aria-label="Close investment dialog">
                ×
              </button>
            </div>

            <form className="dashboard-investment-form" onSubmit={submitInvestment}>
              <div className="dashboard-investment-meta">
                <div>
                  <span>ROI</span>
                  <strong>{selectedPlan.roi}</strong>
                </div>
                <div>
                  <span>Term</span>
                  <strong>{selectedPlan.duration}</strong>
                </div>
                <div>
                  <span>Range</span>
                  <strong>{formatCurrency(planMinimum)} – {formatCurrency(planMaximum)}</strong>
                </div>
              </div>

              <label htmlFor="investment-funding-source">Funding source</label>
              {hasFundingSources ? (
                <select id="investment-funding-source" value={fundingSource} onChange={(event) => setFundingSource(event.target.value)}>
                  <option value="">Select funding source</option>
                  {fundingSources.map((source) => (
                    <option key={source.name} value={source.name}>{source.name} · {formatCurrency(source.balance)}</option>
                  ))}
                </select>
              ) : (
                <div className="dashboard-investment-empty-state">No funding source available yet.</div>
              )}

              <div className="dashboard-investment-balance">
                <span>Available balance</span>
                <strong>{hasFundingSources && fundingSource ? formatCurrency(sourceBalance) : "—"}</strong>
              </div>

              <label htmlFor="investment-amount">Investment amount</label>
              <input
                id="investment-amount"
                type="number"
                min={planMinimum}
                max={planMaximum}
                step="100"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />

              <div className="dashboard-investment-validation">
                {!numericAmount && <small>Enter an amount to continue.</small>}
                {numericAmount > 0 && !hasFundingSources && (
                  <small>Funding sources are not available for this account yet.</small>
                )}
                {numericAmount > 0 && hasFundingSources && !isWithinPlanRange && (
                  <small>Investment must be between {formatCurrency(planMinimum)} and {formatCurrency(planMaximum)}.</small>
                )}
                {numericAmount > 0 && hasFundingSources && isWithinPlanRange && !isSufficientBalance && (
                  <small>Selected funding source balance is insufficient for this amount.</small>
                )}
                {numericAmount > 0 && hasFundingSources && isWithinPlanRange && isSufficientBalance && (
                  <small>Projected return: {formatCurrency(projectedReturn)} after {selectedPlan.duration}.</small>
                )}
              </div>

              <div className="dashboard-investment-actions">
                <button type="button" className="dashboard-investment-cancel" onClick={() => setSelectedPlan(null)}>Cancel</button>
                <button type="submit" className="dashboard-investment-submit" disabled={!isReadyToSubmit}>Confirm investment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lastInvestment && (
        <div className="dashboard-plan-summary" role="status">
          <h3>Investment request submitted</h3>
          <p>{formatCurrency(lastInvestment.amount)} allocated to {lastInvestment.plan} via {lastInvestment.fundingSource}.</p>
          <p>Projected return: {formatCurrency(lastInvestment.projectedReturn)} over {lastInvestment.duration} at {lastInvestment.roi} ROI.</p>
        </div>
      )}
    </section>
  );
}

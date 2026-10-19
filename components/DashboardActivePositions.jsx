"use client";

function formatUsd(amount) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount);
}

export default function DashboardActivePositions({ investments = [], error = "" }) {
  const positions = investments.filter(investment => investment.status === "pending" || investment.status === "active");
  const activeCount = investments.filter(investment => investment.status === "active").length;
  const lockedBalance = positions.reduce((total, investment) => total + investment.amount, 0);

  return (
    <section className="dashboard-active-positions" aria-labelledby="active-positions-title">
      <h2 id="active-positions-title">Active Positions</h2>
      {error && <p className="dashboard-empty-state" role="alert">{error}</p>}
      <div className="dashboard-position-summary">
        <span>Active investments</span>
        <strong>{error ? "Unavailable" : activeCount}</strong>
        <small>{error || `${formatUsd(lockedBalance)} reserved in pending or active positions.`}</small>
      </div>
      <div className="dashboard-position-table">
        <div><span>Plan</span><span>Amount</span><span>ROI</span><span>Status</span></div>
        {positions.length ? positions.map(investment => (
          <div key={investment.id}>
            <span>{investment.plan}</span>
            <span>{formatUsd(investment.amount)}</span>
            <span>{investment.roi}%</span>
            <span>{investment.status}</span>
          </div>
        )) : !error && <p>No active positions yet</p>}
      </div>
    </section>
  );
}

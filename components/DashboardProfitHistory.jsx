"use client";

function formatProfit(profit) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: profit.currency || "USD",
    maximumFractionDigits: profit.currency === "USD" ? 2 : 8,
  }).format(profit.profit);
}

export default function DashboardProfitHistory({ profitHistory = [], investmentProfit = [], error = "" }) {
  const totalLabel = error
    ? "Unavailable"
    : investmentProfit.length === 1
      ? formatProfit({ profit: investmentProfit[0].amount, currency: investmentProfit[0].currency })
      : investmentProfit.length
        ? investmentProfit.map(item => formatProfit({ profit: item.amount, currency: item.currency })).join(" · ")
        : "$0.00";

  return (
    <section className="dashboard-profit-history" aria-labelledby="profit-history-title">
      <h2 id="profit-history-title">Profit History</h2>
      {error && <p className="dashboard-empty-state" role="alert">{error}</p>}
      <div className="dashboard-profit-summary">
        <span>Total settled profit</span>
        <strong>{totalLabel}</strong>
        <small>{error || (profitHistory.length ? `${profitHistory.filter(item => item.status === "settled").length} settled profit record(s)` : "Settled profit records will appear here.")}</small>
      </div>
      <div className="dashboard-profit-table">
        <div><span>Date</span><span>Period</span><span>Profit</span><span>Status</span></div>
        {profitHistory.length ? profitHistory.map(profit => (
          <div key={profit.id}>
            <span>{profit.createdAt ? new Date(profit.createdAt).toLocaleDateString() : "—"}</span>
            <span>{profit.period}</span>
            <span>{formatProfit(profit)}</span>
            <span>{profit.status}</span>
          </div>
        )) : !error && <p>No profit history yet</p>}
      </div>
    </section>
  );
}

"use client";

export default function DashboardProfitHistory() {
  return (
    <section className="dashboard-profit-history" aria-labelledby="profit-history-title">
      <h2 id="profit-history-title">Profit History</h2>
      <div className="dashboard-profit-summary"><span>Total profit</span><strong>$0.00</strong><small>Profit records will appear here after your investments generate returns.</small></div>
      <div className="dashboard-profit-table"><div><span>Date</span><span>Investment</span><span>Profit</span><span>Status</span></div><p>No profit history yet</p></div>
    </section>
  );
}

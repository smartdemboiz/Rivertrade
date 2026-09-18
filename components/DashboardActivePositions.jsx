"use client";

export default function DashboardActivePositions() {
  return (
    <section className="dashboard-active-positions" aria-labelledby="active-positions-title">
      <h2 id="active-positions-title">Active Positions</h2>
      <div className="dashboard-position-summary"><span>Active investments</span><strong>0</strong><small>Your active investment positions will appear here.</small></div>
      <div className="dashboard-position-table"><div><span>Plan</span><span>Amount</span><span>ROI</span><span>Status</span></div><p>No active positions yet</p></div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";

function formatAmount(value, currency) {
  const amount = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 8,
  }).format(Number(value));
  return currency ? `${amount} ${currency}` : amount;
}

export default function DashboardTransactions() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/account/transactions", {
          headers: { Authorization: `Bearer ${token || ""}` },
          cache: "no-store",
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load transaction history.");
        setTransactions(body.data || []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load transaction history.");
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const searchable = `${transaction.type} ${transaction.amount} ${transaction.currency} ${transaction.status} ${transaction.creditedAmount || ""} ${transaction.creditedCurrency || ""}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (type === "all" || transaction.type.toLowerCase() === type);
  });

  return (
    <section className="dashboard-transactions" aria-labelledby="transactions-title">
      <h2 id="transactions-title">Transaction History</h2>
      <div className="dashboard-transaction-filters">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions..." aria-label="Search transactions" />
        <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter transaction type">
          <option value="all">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="investment">Investment</option>
          <option value="profit">Profit</option>
          <option value="swap">Swap</option>
        </select>
      </div>
      {error && <p className="dashboard-deposit-error" role="alert">{error}</p>}
      <div className="dashboard-transaction-table-wrap">
        <table className="dashboard-transaction-table">
          <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Currency</th><th>Balance credited</th><th>Status</th></tr></thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : "—"}</td>
                <td>{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.currency}</td>
                <td>{transaction.type === "deposit"
                  ? transaction.creditedAmount !== null ? formatAmount(transaction.creditedAmount, transaction.creditedCurrency) : transaction.status === "confirmed" ? "Awaiting credit" : "—"
                  : transaction.type === "withdrawal" && transaction.status === "approved" ? "Payout sent"
                    : transaction.status === "completed" ? formatAmount(transaction.amount, transaction.currency) : "—"}</td>
                <td>{transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</td>
              </tr>
            ))}
            {!loading && !error && filteredTransactions.length === 0 && (
              <tr><td className="dashboard-transactions-empty" colSpan="6">No transactions yet</td></tr>
            )}
            {loading && <tr><td className="dashboard-transactions-empty" colSpan="6">Loading transactions…</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

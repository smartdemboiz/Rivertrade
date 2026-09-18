"use client";

import { useState } from "react";

const transactions = [];

export default function DashboardTransactions() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesQuery = `${transaction.type} ${transaction.amount} ${transaction.currency}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (type === "all" || transaction.type.toLowerCase() === type);
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
      <div className="dashboard-transaction-table-wrap">
        <table className="dashboard-transaction-table">
          <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Currency</th><th>Status</th></tr></thead>
          <tbody>
            {filteredTransactions.length ? filteredTransactions.map((transaction) => (
              <tr key={transaction.id}><td>{transaction.date}</td><td>{transaction.type}</td><td>{transaction.amount}</td><td>{transaction.currency}</td><td>{transaction.status}</td></tr>
            )) : <tr><td className="dashboard-transactions-empty" colSpan="5">No transactions yet</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

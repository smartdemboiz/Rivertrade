"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

const definitions = {
  customers: { title: "Customer management", description: "Review customer accounts, balances, and account status.", columns: ["firstName", "lastName", "email", "country", "currency"], labels: ["First name", "Last name", "Email", "Country", "Currency"] },
  kyc: { title: "KYC management", description: "Review customer identity verification requests and submitted documents.", columns: ["userName", "email", "documentType", "status", "documentUrl"], labels: ["User", "Email", "Document type", "Status", "Identity document"] },
  investments: { title: "Investments", description: "Review customer investments, USD allocation, source currency, conversion rate, and reservation status.", columns: ["userName", "plan", "amount", "funding_amount", "funding_currency", "exchange_rate_usd", "status"], labels: ["User", "Plan", "Investment (USD)", "Debited amount", "Debited currency", "USD rate", "Status"] },
  userFunds: { title: "Manage User Funds", description: "Track customer fund balances. Balances are recorded in the specified currency.", columns: ["userName", "balance", "currency", "type", "status"], labels: ["User", "Balance", "Currency", "Type", "Status"] },
  expertTraders: { title: "Manage Expert Traders", description: "Monitor expert traders, performance, and assigned portfolios.", columns: ["name", "specialty", "performance", "status"], labels: ["Name", "Specialty", "Performance", "Status"] },
  staff: { title: "Staff management", description: "Manage operational access and internal responsibilities.", columns: ["name", "email", "role", "status"], labels: ["Name", "Email", "Role", "Status"] },
  roles: { title: "Manage roles", description: "Define permissions for your operations team.", columns: ["name", "description", "users"], labels: ["Name", "Description", "Users"] },
  schedules: { title: "Schedules", description: "Maintain operating dates and internal schedules.", columns: ["startDate", "endDate", "description"], labels: ["Start date", "End date", "Description"] },
  holidays: { title: "Holidays", description: "Manage market and operational holidays.", columns: ["name", "date", "type"], labels: ["Name", "Date", "Type"] },
  schemas: { title: "Investment schemas", description: "Configure investment ranges and expected returns.", columns: ["name", "minAmount", "maxAmount", "returnRate", "duration"], labels: ["Name", "Minimum", "Maximum", "Return %", "Duration"] },
  crowdSchemas: { title: "Crowd schemas", description: "Configure collective investment opportunities.", columns: ["name", "participants", "targetAmount", "status"], labels: ["Name", "Participants", "Target amount", "Status"] },
  notifications: { title: "Notifications", description: "Review messages sent to customers.", columns: ["recipient", "subject", "status"], labels: ["Recipient", "Subject", "Status"] },
  deposits: { title: "Deposit operations", description: "Verify payment receipt, then confirm to credit a standard deposit or managed-account funding request.", columns: ["user", "amount", "currency", "status", "purpose", "method", "network", "reference", "creditedAmount", "creditedCurrency", "exchange_rate"], labels: ["User", "Amount", "Deposit currency", "Status", "Purpose", "Method", "Network", "Payment reference", "Credited amount", "Credit currency", "Exchange rate"] },
  withdrawals: { title: "Withdrawal operations", description: "Review payout details. Send the payout outside RiverTrade before marking it as sent.", columns: ["user", "amount", "currency", "status", "method", "asset", "network", "destination_details"], labels: ["User", "Amount", "Currency", "Status", "Method", "Payout asset", "Network", "Payout details"] },
  swaps: { title: "Wallet swap activity", description: "Verify source-chain transactions and cross-chain destination settlement before completing or failing a swap record.", columns: ["user", "fromAsset", "fromAmount", "toAsset", "toAmount", "fromChainId", "toChainId", "txHash", "route_provider", "status"], labels: ["User", "From", "Sent", "To", "Estimated receive", "Source chain", "Destination chain", "Transaction hash", "Route", "Settlement status"] },
  managedAccounts: { title: "Managed accounts", description: "Manage account setup, assigned strategy, risk profile, reported returns, and portfolio reviews.", columns: ["user", "strategy", "allocation", "risk_profile", "account_value", "account_currency", "total_return", "monthly_return", "management_fee", "next_review_at", "review_requested_at", "status"], labels: ["User", "Strategy", "Allocation", "Risk profile", "Account value", "Currency", "Total return", "Monthly return %", "Management fee %", "Next review", "Review requested", "Status"] },
  investmentPlans: { title: "Investment plans", description: "Control plan ranges, ROI, and active strategies for all clients.", columns: ["name", "minimum", "maximum", "roi", "duration", "status"], labels: ["Plan", "Min", "Max", "ROI", "Duration", "Status"] },
  profitHistory: { title: "Profit history", description: "Credit investment profit directly to a customer's available balance and keep an auditable transaction record.", columns: ["user", "period", "profit", "currency", "status"], labels: ["User", "Period", "Profit", "Currency", "Status"] },
  profiles: { title: "Profile management", description: "Review personal details, verification status, and user account information.", columns: ["user", "fullName", "email", "phone", "country", "verified"], labels: ["User", "Full name", "Email", "Phone", "Country", "Verified"] },
  referrals: { title: "Referral program", description: "Track referrals, campaigns, and user reward performance.", columns: ["user", "code", "referrals", "earnings", "status"], labels: ["User", "Code", "Referrals", "Earnings", "Status"] },
  support: { title: "Support center", description: "Review customer requests, contact details, and resolution progress.", columns: ["name", "email", "subject", "message", "status", "priority"], labels: ["Name", "Email", "Subject", "Message", "Status", "Priority"] },
  settings: { title: "Platform settings", description: "Manage business configuration, withdrawals, branding, and compliance rules.", columns: ["key", "value", "category"], labels: ["Key", "Value", "Category"] },
  paymentSettings: { title: "Payment details", description: "Manage wallet addresses and payment instructions for deposits.", columns: ["method", "asset", "network", "label", "value", "instructions", "destination", "enabled"], labels: ["Method", "Asset", "Network", "Label", "Details", "Instructions", "Destination", "Enabled"] },
  withdrawalSettings: { title: "Withdrawal methods", description: "Configure the payout methods users can choose when requesting a withdrawal.", columns: ["method", "asset", "network", "instructions", "enabled"], labels: ["Method", "Asset", "Network", "Instructions", "Enabled"] },
  transactions: { title: "Transactions", description: "Monitor deposits, withdrawals, and investment activity.", columns: ["user", "amount", "type", "status"], labels: ["User", "Amount", "Type", "Status"] },
};

const withdrawalMethodOptions = [
  "Bank Transfer",
  "Cryptocurrency",
  "PayPal",
  "PayPal Friends & Family",
  "PayPal Goods & Services",
  "Wise",
  "Zelle",
  "Cash App",
  "Venmo",
  "Other",
];
const withdrawalAssetOptions = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "Bitcoin (BTC)",
  "Tether (USDT)",
  "Ethereum (ETH)",
  "Solana (SOL)",
  "USD Coin (USDC)",
  "Binance Coin (BNB)",
  "Ripple (XRP)",
  "Dogecoin (DOGE)",
  "Cardano (ADA)",
  "Chainlink (LINK)",
  "Litecoin (LTC)",
  "Bitcoin Cash (BCH)",
  "Polkadot (DOT)",
  "Avalanche (AVAX)",
  "Other",
];
const withdrawalNetworkOptions = [
  "ACH",
  "Wire Transfer",
  "SWIFT",
  "SEPA",
  "Faster Payments",
  "Interac e-Transfer",
  "Bitcoin Network",
  "ERC20",
  "TRC20",
  "BEP20",
  "Polygon",
  "Solana Network",
  "Other",
];

const operationalActions = {
  deposits: [["confirm", "Confirm"], ["reject", "Reject"]],
  withdrawals: [["process", "Process"], ["approve", "Approve"], ["reject", "Reject"]],
  swaps: [["complete", "Complete"], ["fail", "Fail"]],
  managedAccounts: [["activate", "Activate"], ["review", "Review"], ["pause", "Pause"]],
  investments: [["activate", "Activate"], ["complete", "Complete"], ["cancel", "Cancel"]],
  profitHistory: [["settle", "Credit profit"]],
  referrals: [["activate", "Activate"], ["deactivate", "Deactivate"]],
  support: [["resolve", "Resolve"], ["close", "Close"], ["reopen", "Reopen"]],
};

const apiBase = () => process.env.NEXT_PUBLIC_API_URL || "";
const buildUrl = path => `${apiBase()}${path}`;
const displayValue = value => value === undefined || value === null || value === "" ? "-" : String(value);
const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : "";
  return token && token !== "null" ? { Authorization: `Bearer ${token}` } : {};
};

export default function AdminRecords({ section }) {
  const definition = definitions[section] || definitions.customers;
  const [records, setRecords] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [profitCustomers, setProfitCustomers] = useState([]);
  const [profitFormOpen, setProfitFormOpen] = useState(false);
  const [profitCustomerId, setProfitCustomerId] = useState("");
  const [profitAmount, setProfitAmount] = useState("");
  const [profitPeriod, setProfitPeriod] = useState("");
  const [profitRequestId, setProfitRequestId] = useState("");
  const [savingProfit, setSavingProfit] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(buildUrl(`/api/admin/${section}`), { headers: authHeaders() });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load records");
      setRecords(body.data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [section]);

  useEffect(() => {
    if (section !== "profitHistory") return undefined;
    let active = true;
    fetch(buildUrl("/api/admin/customers"), { headers: authHeaders() })
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load customers.");
        if (active) setProfitCustomers((body.data || []).filter(customer => !customer.role || customer.role === "customer"));
      })
      .catch(loadError => {
        if (active) setError(loadError.message || "Unable to load customers.");
      });
    return () => { active = false; };
  }, [section]);

  function openProfitForm() {
    setProfitCustomerId("");
    setProfitAmount("");
    setProfitPeriod(new Date().toLocaleString(undefined, { month: "long", year: "numeric" }));
    setProfitRequestId(window.crypto.randomUUID());
    setProfitFormOpen(true);
    setError("");
    setNotice("");
  }

  async function creditProfit(event) {
    event.preventDefault();
    const customer = profitCustomers.find(profile => profile.id === profitCustomerId);
    if (!customer) {
      setError("Select a customer before crediting profit.");
      return;
    }
    const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(" ")
      || customer.email
      || customer.id;
    const currency = String(customer.currency || "USD").toUpperCase();
    if (!window.confirm(`Credit ${profitAmount} ${currency} to ${customerName}'s available balance? This will be recorded as paid profit and cannot be undone here.`)) return;

    setSavingProfit(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(buildUrl("/api/admin/profits"), {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profitCustomerId,
          amount: profitAmount,
          period: profitPeriod,
          requestId: profitRequestId,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to credit investment profit.");
      setProfitFormOpen(false);
      setProfitAmount("");
      setProfitRequestId("");
      setNotice(`Credited ${body.data.profit} ${body.data.currency} to ${customerName}.`);
      await load();
    } catch (creditError) {
      setError(creditError.message || "Unable to credit investment profit.");
    } finally {
      setSavingProfit(false);
    }
  }

  function openEditor(record = {}) {
    setEditing(record.id || "new");
    const values = Object.fromEntries(definition.columns.map((column) => {
      if (column === "enabled") return [column, record.enabled ?? true];
      if (column === "destination") return [column, record.destination || (section === "paymentSettings" ? "deposit" : "withdrawal")];
      if (column === "currency" && section === "userFunds") return [column, record.currency || "USD"];
      return [column, record[column] || ""];
    }));
    if (section === "withdrawalSettings") {
      values.method = record.method || record.label || "";
      values.value = record.value || "";
      values.destination = "withdrawal";
    }
    setForm(values);
  }

  async function save(event) {
    event.preventDefault();
    const isNew = editing === "new";
    const managedAccountFields = section === "managedAccounts"
      ? Object.fromEntries(Object.entries(form).filter(([key]) => !["user", "userName"].includes(key)))
      : form;
    const payload = section === "managedAccounts"
      ? Object.fromEntries(Object.entries(managedAccountFields).map(([key, value]) => [
          key,
          value === "" && ["total_return", "monthly_return", "management_fee", "next_review_at"].includes(key)
            ? null
            : value,
        ]))
      : section === "withdrawalSettings"
      ? {
          ...form,
          label: form.method,
          value: form.value || "Payout details provided by the user",
          destination: "withdrawal",
        }
      : form;
    const response = await fetch(buildUrl(`/api/admin/${section}${isNew ? "" : `/${editing}`}`), {
      method: isNew ? "POST" : "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    if (!response.ok) { setError(body.error || "Unable to save record"); return; }
    setEditing(null);
    setError("");
    load();
  }

  async function remove(id) {
    const message = section === "customers"
      ? "This permanently disables customer sign-in and anonymizes personal details. Linked financial history is retained. Continue?"
      : "Delete this record?";
    if (!window.confirm(message)) return;
    const response = await fetch(buildUrl(`/api/admin/${section}/${id}`), { method: "DELETE", headers: authHeaders() });
    if (!response.ok) { const body = await response.json(); setError(body.error || "Unable to delete record"); return; }
    load();
  }

  async function updateKyc(id, status) {
    const response = await fetch(buildUrl(`/api/admin/kyc/${id}`), { method: "PATCH", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (response.ok) load();
  }

  async function applyAction(id, action) {
    if (section === "withdrawals" && action === "approve"
      && !window.confirm("Confirm only after you have sent the payout outside RiverTrade. Mark this withdrawal as paid?")) return;
    const profitRecord = section === "profitHistory" && records.find(record => record.id === id);
    if (profitRecord && action === "settle"
      && !window.confirm(`Credit ${profitRecord.profit} ${profitRecord.currency || "USD"} to ${profitRecord.user}'s available balance?`)) return;
    const response = await fetch(buildUrl(`/api/admin/${section}/${id}/action`), {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const body = await response.json();
    if (!response.ok) { setError(body.error || "Unable to apply action"); return; }
    setError("");
    load();
  }

  return (
    <>
      <div className="admin-intro"><div><p className="eyebrow">Workspace section</p><h2>{definition.title}</h2><p>{definition.description}</p></div>{section === "profitHistory" ? <button className="button" onClick={openProfitForm}><Plus size={16} /> Credit investment profit</button> : section !== "customers" && section !== "deposits" && section !== "investments" && section !== "withdrawals" && section !== "managedAccounts" && <button className="button" onClick={() => openEditor()}><Plus size={16} /> Add new</button>}</div>
      {error && <p className="form-message">{error}</p>}
      {notice && <p className="form-message success" role="status">{notice}</p>}
      {editing && (section === "withdrawalSettings" ? (
        <form className="admin-editor withdrawal-method-editor" onSubmit={save}>
          <div className="withdrawal-method-heading">
            <h3>{editing === "new" ? "Add a withdrawal option" : "Edit withdrawal option"}</h3>
            <p>Choose what customers can select. They will provide their own payout details when requesting a withdrawal. Common methods, assets, and networks are suggested; custom values are also accepted.</p>
          </div>
          <label>Method<input list="withdrawal-method-options" required value={form.method || ""} onChange={event => setForm({ ...form, method: event.target.value })} placeholder="e.g. Bank Transfer, Cryptocurrency" /><datalist id="withdrawal-method-options">{withdrawalMethodOptions.map(option => <option key={option} value={option} />)}</datalist></label>
          <label>Asset<input list="withdrawal-asset-options" required value={form.asset || ""} onChange={event => setForm({ ...form, asset: event.target.value })} placeholder="e.g. USD, BTC, USDT" /><datalist id="withdrawal-asset-options">{withdrawalAssetOptions.map(option => <option key={option} value={option} />)}</datalist></label>
          <label>Network<input list="withdrawal-network-options" required value={form.network || ""} onChange={event => setForm({ ...form, network: event.target.value })} placeholder="e.g. ACH, Wire Transfer, ERC20" /><datalist id="withdrawal-network-options">{withdrawalNetworkOptions.map(option => <option key={option} value={option} />)}</datalist></label>
          <label className="withdrawal-instructions">Instructions<textarea rows="3" value={form.instructions || ""} onChange={event => setForm({ ...form, instructions: event.target.value })} placeholder="Optional guidance shown with this withdrawal option" /></label>
          <div className="withdrawal-method-controls">
            <label>Availability<select value={form.enabled !== undefined ? String(form.enabled) : "true"} onChange={event => setForm({ ...form, enabled: event.target.value === "true" })}><option value="true">Enabled</option><option value="false">Disabled</option></select></label>
            <div className="withdrawal-method-actions"><button className="button" type="submit">Save method</button><button className="text-link" type="button" onClick={() => setEditing(null)}>Cancel</button></div>
          </div>
        </form>
      ) : (
        <form className="admin-editor" onSubmit={save}>
          {definition.columns.map((column, index) => (
            <label key={column}>
              {definition.labels[index]}
              {section === "paymentSettings" && (column === "value" || column === "instructions")
                ? <textarea required={column === "value"} rows="4" value={form[column] || ""} onChange={event => setForm({ ...form, [column]: event.target.value })} />
                : section === "paymentSettings" && column === "destination"
                  ? <select value={form[column] || "deposit"} onChange={event => setForm({ ...form, [column]: event.target.value })}><option value="deposit">Deposit only</option><option value="withdrawal">Withdrawal only</option></select>
                  : section === "managedAccounts" && ["account_value", "total_return", "monthly_return", "management_fee"].includes(column)
                    ? <input type="number" step="any" required={column === "account_value"} value={form[column] ?? ""} onChange={event => setForm({ ...form, [column]: event.target.value })} />
                    : section === "managedAccounts" && column === "next_review_at"
                      ? <input type="date" value={form[column] || ""} onChange={event => setForm({ ...form, [column]: event.target.value })} />
                      : section === "managedAccounts" && column === "risk_profile"
                        ? <select value={form[column] || "Balanced"} onChange={event => setForm({ ...form, [column]: event.target.value })}><option>Conservative</option><option>Balanced</option><option>Aggressive</option></select>
                        : section === "managedAccounts" && ["user", "review_requested_at"].includes(column)
                        ? <input readOnly value={form[column] || ""} />
                        : column === "enabled"
                    ? <select value={form[column] !== undefined ? String(form[column]) : "true"} onChange={event => setForm({ ...form, [column]: event.target.value === "true" })}><option value="true">Enabled</option><option value="false">Disabled</option></select>
                    : <input required={column !== "description"} readOnly={section === "customers" && column === "email"} value={form[column] || ""} onChange={event => setForm({ ...form, [column]: event.target.value })} />}
            </label>
          ))}
          <div><button className="button" type="submit">Save</button><button className="text-link" type="button" onClick={() => setEditing(null)}>Cancel</button></div>
        </form>
      ))}
      {section === "profitHistory" && profitFormOpen && (
        <form className="admin-editor" onSubmit={creditProfit}>
          <label>Customer
            <select required value={profitCustomerId} onChange={event => setProfitCustomerId(event.target.value)}>
              <option value="">Choose a customer</option>
              {profitCustomers.map(customer => {
                const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email;
                return <option key={customer.id} value={customer.id}>{name} · {customer.email} · {String(customer.currency || "USD").toUpperCase()}</option>;
              })}
            </select>
          </label>
          <label>Profit amount
            <input required type="number" min="0.00000001" step="0.00000001" value={profitAmount} onChange={event => setProfitAmount(event.target.value)} />
          </label>
          <label>Period or note
            <input required maxLength={80} value={profitPeriod} onChange={event => setProfitPeriod(event.target.value)} />
          </label>
          <p className="profit-credit-note">Profit is credited immediately to the selected customer’s available account balance and recorded in transaction history.</p>
          <div>
            <button className="button" type="submit" disabled={savingProfit || profitCustomers.length === 0}>{savingProfit ? "Crediting..." : "Confirm profit credit"}</button>
            <button className="text-link" type="button" onClick={() => { setProfitFormOpen(false); setProfitRequestId(""); }} disabled={savingProfit}>Cancel</button>
          </div>
        </form>
      )}
      <section className="admin-panel transaction-panel">
        <div className="admin-panel-head">
          <h2>{loading ? "Loading..." : `${records.length} records`}</h2>
          <button className="text-link" onClick={load}>Refresh</button>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr>{definition.labels.map(label => <th key={label}>{label}</th>)}<th>Actions</th></tr></thead>
            <tbody>
              {records.length ? records.map(record => {
                const canEdit = !["kyc", "deposits", "investments", "withdrawals", "profitHistory", "swaps"].includes(section);
                const canDelete = section !== "customers" && !["kyc", "deposits", "investments", "withdrawals", "profitHistory", "swaps"].includes(section);
                const actions = (operationalActions[section] || []).filter(([action]) => (
                  section === "deposits"
                    ? action === "confirm" ? record.status !== "rejected" && !record.isCredited : record.status === "pending"
                    : section === "withdrawals"
                      ? ["pending", "processing"].includes(record.status) && action !== "process" || record.status === "pending" && action === "process"
                      : section === "investments"
                        ? record.status === "pending" ? action === "activate" || action === "cancel" : record.status === "active" && action === "complete"
                        : section === "profitHistory"
                          ? record.status === "pending" && action === "settle"
                          : section === "swaps"
                            ? record.status === "pending"
                            : true
                ));

                return (
                  <tr key={record.id}>
                    {definition.columns.map(column => (
                      <td key={column}>
                        {column === "status" && section === "kyc"
                          ? <span className="health">{displayValue(record[column] || "pending")}</span>
                          : column === "documentUrl" && section === "kyc"
                            ? record.documentUrl ? <a href={record.documentUrl} target="_blank" rel="noreferrer">View document</a> : "Unavailable"
                            : column === "message" && section === "support"
                              ? <details><summary>View message</summary><p>{displayValue(record[column])}</p></details>
                              : column === "destination_details" && section === "withdrawals"
                                ? Object.entries(record.destination_details || {}).map(([key, value]) => `${key}: ${value}`).join(", ") || "Unavailable"
                                : column === "creditedAmount" && record.isCredited
                                  ? `${displayValue(record[column])} ${displayValue(record.creditedCurrency)}`
                                  : column === "exchange_rate" && record.exchange_rate
                                    ? `1 ${displayValue(record.currency)} = ${displayValue(record.exchange_rate)} ${displayValue(record.creditedCurrency)}`
                                    : displayValue(record[column])}
                      </td>
                    ))}
                    <td>
                      <span className="row-actions">
                        {canEdit && <button type="button" aria-label="Edit record" onClick={() => openEditor(record)}><Pencil size={14} /></button>}
                        {section === "kyc" && <>
                          <button type="button" aria-label="Approve KYC" onClick={() => updateKyc(record.id, "approved")}><Check size={14} /></button>
                          <button type="button" aria-label="Reject KYC" onClick={() => updateKyc(record.id, "rejected")}><X size={14} /></button>
                        </>}
                        {actions.map(([action, label]) => (
                          <button type="button" key={action} onClick={() => applyAction(record.id, action)}>
                            {section === "deposits" && action === "confirm" ? record.status === "confirmed" ? "Credit deposit" : "Confirm + credit" : section === "withdrawals" && action === "approve" ? "Mark payout sent" : label}
                          </button>
                        ))}
                        {canDelete && <button type="button" aria-label="Delete record" onClick={() => remove(record.id)}><Trash2 size={14} /></button>}
                        {section === "customers" && <button type="button" aria-label="Anonymize customer account" onClick={() => remove(record.id)}><Trash2 size={14} /></button>}
                      </span>
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan={definition.columns.length + 1}>{loading ? "Loading records..." : "No records available yet."}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

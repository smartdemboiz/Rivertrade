"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

const definitions = {
  customers: { title: "Customer management", description: "Review customer accounts, balances, and account status.", columns: ["firstName", "lastName", "email", "country", "currency"], labels: ["First name", "Last name", "Email", "Country", "Currency"] },
  kyc: { title: "KYC management", description: "Review verification requests and keep compliance work moving.", columns: ["userName", "email", "documentType", "status"], labels: ["User", "Email", "Document", "Status"] },
  investments: { title: "Investments", description: "Manage investment plans, active strategies, and customer allocation data.", columns: ["userName", "plan", "amount", "status"], labels: ["User", "Plan", "Amount", "Status"] },
  userFunds: { title: "Manage User Funds", description: "Track wallet balances, transaction activity, and fund movement approvals.", columns: ["userName", "balance", "type", "status"], labels: ["User", "Balance", "Type", "Status"] },
  expertTraders: { title: "Manage Expert Traders", description: "Monitor expert traders, performance, and assigned portfolios.", columns: ["name", "specialty", "performance", "status"], labels: ["Name", "Specialty", "Performance", "Status"] },
  staff: { title: "Staff management", description: "Manage operational access and internal responsibilities.", columns: ["name", "email", "role", "status"], labels: ["Name", "Email", "Role", "Status"] },
  roles: { title: "Manage roles", description: "Define permissions for your operations team.", columns: ["name", "description", "users"], labels: ["Name", "Description", "Users"] },
  schedules: { title: "Schedules", description: "Maintain operating dates and internal schedules.", columns: ["startDate", "endDate", "description"], labels: ["Start date", "End date", "Description"] },
  holidays: { title: "Holidays", description: "Manage market and operational holidays.", columns: ["name", "date", "type"], labels: ["Name", "Date", "Type"] },
  schemas: { title: "Investment schemas", description: "Configure investment ranges and expected returns.", columns: ["name", "minAmount", "maxAmount", "returnRate", "duration"], labels: ["Name", "Minimum", "Maximum", "Return %", "Duration"] },
  crowdSchemas: { title: "Crowd schemas", description: "Configure collective investment opportunities.", columns: ["name", "participants", "targetAmount", "status"], labels: ["Name", "Participants", "Target amount", "Status"] },
  notifications: { title: "Notifications", description: "Review messages sent to customers.", columns: ["recipient", "subject", "status"], labels: ["Recipient", "Subject", "Status"] },
  deposits: { title: "Deposit operations", description: "Monitor incoming deposits, payment methods, and approval workflow.", columns: ["user", "amount", "currency", "status", "method"], labels: ["User", "Amount", "Currency", "Status", "Method"] },
  withdrawals: { title: "Withdrawal operations", description: "Review requested withdrawals and approve or reject them.", columns: ["user", "amount", "currency", "status", "method"], labels: ["User", "Amount", "Currency", "Status", "Method"] },
  swaps: { title: "Swap activity", description: "Track crypto swaps and settlement status for user orders.", columns: ["user", "fromAsset", "toAsset", "amount", "status"], labels: ["User", "From", "To", "Amount", "Status"] },
  managedAccounts: { title: "Managed accounts", description: "Manage assigned strategies, allocations, and active portfolio oversight.", columns: ["user", "strategy", "allocation", "status"], labels: ["User", "Strategy", "Allocation", "Status"] },
  investmentPlans: { title: "Investment plans", description: "Control plan ranges, ROI, and active strategies for all clients.", columns: ["name", "minimum", "maximum", "roi", "duration", "status"], labels: ["Plan", "Min", "Max", "ROI", "Duration", "Status"] },
  profitHistory: { title: "Profit history", description: "Review generated profits, settled periods, and pending distributions.", columns: ["user", "period", "profit", "status"], labels: ["User", "Period", "Profit", "Status"] },
  profiles: { title: "Profile management", description: "Review personal details, verification status, and user account information.", columns: ["user", "fullName", "email", "phone", "country", "verified"], labels: ["User", "Full name", "Email", "Phone", "Country", "Verified"] },
  referrals: { title: "Referral program", description: "Track referrals, campaigns, and user reward performance.", columns: ["user", "code", "referrals", "earnings", "status"], labels: ["User", "Code", "Referrals", "Earnings", "Status"] },
  support: { title: "Support center", description: "Monitor customer tickets, priorities, and support resolution progress.", columns: ["user", "subject", "status", "priority"], labels: ["User", "Subject", "Status", "Priority"] },
  settings: { title: "Platform settings", description: "Manage business configuration, withdrawals, branding, and compliance rules.", columns: ["key", "value", "category"], labels: ["Key", "Value", "Category"] },
  paymentSettings: { title: "Payment details", description: "Manage the wallet addresses and payment instructions shown on the user Deposit screen.", columns: ["method", "asset", "network", "label", "value", "instructions", "enabled"], labels: ["Method", "Asset", "Network", "Label", "Details", "Instructions", "Enabled"] },
  transactions: { title: "Transactions", description: "Monitor deposits, withdrawals, and investment activity.", columns: ["user", "amount", "type", "status"], labels: ["User", "Amount", "Type", "Status"] },
};

const operationalActions = {
  deposits: [["confirm", "Confirm"], ["reject", "Reject"]],
  withdrawals: [["process", "Process"], ["approve", "Approve"], ["reject", "Reject"]],
  swaps: [["complete", "Complete"], ["fail", "Fail"]],
  managedAccounts: [["activate", "Activate"], ["review", "Review"], ["pause", "Pause"]],
  investments: [["activate", "Activate"], ["complete", "Complete"], ["cancel", "Cancel"]],
  profitHistory: [["settle", "Settle"], ["reopen", "Reopen"]],
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

  function openEditor(record = {}) {
    setEditing(record.id || "new");
    setForm(Object.fromEntries(definition.columns.map(column => [column, record[column] || ""])));
  }

  async function save(event) {
    event.preventDefault();
    const isNew = editing === "new";
    const response = await fetch(buildUrl(`/api/admin/${section}${isNew ? "" : `/${editing}`}`), {
      method: isNew ? "POST" : "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await response.json();
    if (!response.ok) { setError(body.error || "Unable to save record"); return; }
    setEditing(null);
    setError("");
    load();
  }

  async function remove(id) {
    if (!window.confirm("Delete this record?")) return;
    const response = await fetch(buildUrl(`/api/admin/${section}/${id}`), { method: "DELETE", headers: authHeaders() });
    if (!response.ok) { const body = await response.json(); setError(body.error || "Unable to delete record"); return; }
    load();
  }

  async function updateKyc(id, status) {
    const response = await fetch(buildUrl(`/api/admin/kyc/${id}`), { method: "PATCH", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (response.ok) load();
  }

  async function applyAction(id, action) {
    const response = await fetch(buildUrl(`/api/admin/${section}/${id}/action`), { method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const body = await response.json();
    if (!response.ok) { setError(body.error || "Unable to apply action"); return; }
    setError("");
    load();
  }

  return (
    <>
      <div className="admin-intro"><div><p className="eyebrow">Workspace section</p><h2>{definition.title}</h2><p>{definition.description}</p></div><button className="button" onClick={() => openEditor()}><Plus size={16} /> Add new</button></div>
      {error && <p className="form-message">{error}</p>}
      {editing && <form className="admin-editor" onSubmit={save}>{definition.columns.map((column, index) => <label key={column}>{definition.labels[index]}{section === "paymentSettings" && ["value", "instructions"].includes(column) ? <textarea required={column === "value"} rows="4" value={form[column] || ""} onChange={event => setForm({ ...form, [column]: event.target.value })} /> : <input required={column !== "description"} value={form[column] || ""} onChange={event => setForm({ ...form, [column]: event.target.value })} />}</label>)}<div><button className="button" type="submit">Save</button><button className="text-link" type="button" onClick={() => setEditing(null)}>Cancel</button></div></form>}
      <section className="admin-panel transaction-panel"><div className="admin-panel-head"><h2>{loading ? "Loading..." : `${records.length} records`}</h2><button className="text-link" onClick={load}>Refresh</button></div><div className="table-scroll"><table><thead><tr>{definition.labels.map(label => <th key={label}>{label}</th>)}<th>Actions</th></tr></thead><tbody>{records.length ? records.map(record => <tr key={record.id}>{definition.columns.map(column => <td key={column}>{column === "status" && section === "kyc" ? <span className="health">{displayValue(record[column] || "pending")}</span> : displayValue(record[column])}</td>)}<td><span className="row-actions"><button type="button" aria-label="Edit record" onClick={() => openEditor(record)}><Pencil size={14} /></button>{section === "kyc" && <><button type="button" aria-label="Approve KYC" onClick={() => updateKyc(record.id, "approved")}><Check size={14} /></button><button type="button" aria-label="Reject KYC" onClick={() => updateKyc(record.id, "rejected")}><X size={14} /></button></>}{(operationalActions[section] || []).map(([action, label]) => <button type="button" key={action} onClick={() => applyAction(record.id, action)}>{label}</button>)}<button type="button" aria-label="Delete record" onClick={() => remove(record.id)}><Trash2 size={14} /></button></span></td></tr>) : <tr><td colSpan={definition.columns.length + 1}>{loading ? "Loading records..." : "No records available yet."}</td></tr>}</tbody></table></div></section>
    </>
  );
}

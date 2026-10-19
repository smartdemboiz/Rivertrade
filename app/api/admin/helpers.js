import { createClient } from "@supabase/supabase-js";
import { getCurrencyFractionDigits, getDepositExchangeRate } from "../../../lib/deposit-exchange-rate.js";

export const fallbackStats = {
  totalUsers: 2543,
  totalRevenue: 45231,
  activeInvestments: 1234,
  pendingKyc: 48,
  usersChange: 12.5,
  revenueChange: 8.2,
  investmentsChange: 5.1,
  kycChange: 15,
};

export const fallbackTransactions = [
  { id: "TXN-1001", user: "Ava Thompson", amount: "$2,500", type: "Deposit", status: "Completed", date: "Today" },
  { id: "TXN-1002", user: "Noah Lewis", amount: "$1,200", type: "Investment", status: "Pending", date: "Today" },
  { id: "TXN-1003", user: "Mila Gomez", amount: "$800", type: "Withdrawal", status: "Completed", date: "Yesterday" },
  { id: "TXN-1004", user: "Leo Martin", amount: "$3,950", type: "Deposit", status: "Completed", date: "Yesterday" },
];

export const fallbackData = {
  customers: [
    { id: 1, firstName: "Ava", lastName: "Thompson", email: "ava@example.com", country: "United States", currency: "USD" },
    { id: 2, firstName: "Lucas", lastName: "Nguyen", email: "lucas@example.com", country: "Canada", currency: "CAD" },
    { id: 3, firstName: "Mila", lastName: "Gomez", email: "mila@example.com", country: "Spain", currency: "EUR" },
  ],
  kyc: [
    { id: 1, userName: "ava.thompson", email: "ava@example.com", documentType: "Passport", status: "pending" },
    { id: 2, userName: "lucas.nguyen", email: "lucas@example.com", documentType: "Driver License", status: "approved" },
    { id: 3, userName: "mila.gomez", email: "mila@example.com", documentType: "National ID", status: "review" },
  ],
  investments: [
    { id: 1, userName: "ava.thompson", plan: "Gold Plan", amount: "$12,500", status: "active" },
    { id: 2, userName: "mila.gomez", plan: "Elite Plan", amount: "$8,300", status: "active" },
    { id: 3, userName: "lucas.nguyen", plan: "Starter Plan", amount: "$2,400", status: "pending" },
  ],
  userFunds: [
    { id: 1, userName: "ava.thompson", balance: "$24,000", type: "Deposit", status: "available" },
    { id: 2, userName: "mila.gomez", balance: "$7,200", type: "Withdrawal", status: "processing" },
    { id: 3, userName: "lucas.nguyen", balance: "$5,800", type: "Deposit", status: "available" },
  ],
  expertTraders: [
    { id: 1, name: "Daniel Brooks", specialty: "Bitcoin Strategy", performance: "+18.2%", status: "active" },
    { id: 2, name: "Sara Ahmed", specialty: "Macro Crypto", performance: "+12.7%", status: "active" },
    { id: 3, name: "Chloe Park", specialty: "Altcoin Growth", performance: "+9.5%", status: "review" },
  ],
  staff: [
    { id: 1, name: "Nora Lee", email: "nora@rivertrade.com", role: "Operations Lead", status: "active" },
    { id: 2, name: "Javier Ruiz", email: "javier@rivertrade.com", role: "Risk Analyst", status: "active" },
    { id: 3, name: "Amanda Scott", email: "amanda@rivertrade.com", role: "Support Manager", status: "inactive" },
  ],
  deposits: [
    { id: 1, user: "ava.thompson", amount: "$2,500", currency: "BTC", status: "confirmed", method: "Crypto wallet" },
    { id: 2, user: "lucas.nguyen", amount: "$800", currency: "ETH", status: "pending", method: "Bank transfer" },
  ],
  withdrawals: [
    { id: 1, user: "mila.gomez", amount: "$1,250", currency: "USDT", status: "processing", method: "Wallet" },
    { id: 2, user: "ava.thompson", amount: "$4,900", currency: "BTC", status: "approved", method: "Bank transfer" },
  ],
  swaps: [
    { id: 1, user: "ava.thompson", fromAsset: "BTC", toAsset: "ETH", amount: "0.4", status: "completed" },
    { id: 2, user: "lucas.nguyen", fromAsset: "SOL", toAsset: "USDT", amount: "120", status: "pending" },
  ],
  managedAccounts: [
    { id: 1, user: "ava.thompson", strategy: "Balanced Growth", allocation: "60/40", status: "active" },
    { id: 2, user: "mila.gomez", strategy: "Conservative Yield", allocation: "75/25", status: "review" },
  ],
  investmentPlans: [
    { id: 1, name: "Starter Plan", minimum: "$100", maximum: "$2,000", roi: "8.5%", duration: "30 days", status: "active" },
    { id: 2, name: "Gold Plan", minimum: "$2,000", maximum: "$10,000", roi: "12%", duration: "60 days", status: "active" },
  ],
  profitHistory: [
    { id: 1, user: "ava.thompson", period: "March 2026", profit: "$1,420", status: "settled" },
    { id: 2, user: "mila.gomez", period: "April 2026", profit: "$980", status: "pending" },
  ],
  profiles: [
    { id: 1, user: "ava.thompson", fullName: "Ava Thompson", email: "ava@example.com", phone: "+1 555 210 9911", country: "United States", verified: "yes" },
    { id: 2, user: "mila.gomez", fullName: "Mila Gomez", email: "mila@example.com", phone: "+34 600 112 210", country: "Spain", verified: "yes" },
  ],
  referrals: [
    { id: 1, user: "ava.thompson", code: "RIVER-AVA", referrals: 8, earnings: "$420", status: "active" },
    { id: 2, user: "lucas.nguyen", code: "RIVER-LUC", referrals: 3, earnings: "$120", status: "pending" },
  ],
  support: [
    { id: 1, user: "ava.thompson", subject: "Withdrawal delay", status: "open", priority: "high" },
    { id: 2, user: "mila.gomez", subject: "KYC clarification", status: "resolved", priority: "low" },
  ],
  settings: [
    { id: 1, key: "site_name", value: "RiverTrade", category: "branding" },
    { id: 2, key: "min_withdrawal", value: "$50", category: "finance" },
    { id: 3, key: "kyc_required", value: "true", category: "compliance" },
  ],
  paymentSettings: [],
  transactions: fallbackTransactions,
};

export const tableMap = {
  customers: ["profiles"],
  kyc: ["kyc", "user_kyc"],
  investments: ["investments", "investment_plans"],
  userFunds: ["user_funds", "wallets"],
  expertTraders: ["expert_traders", "traders"],
  staff: ["staff", "team_members"],
  deposits: ["deposits", "user_deposits"],
  withdrawals: ["withdrawals", "user_withdrawals"],
  swaps: ["swaps", "crypto_swaps"],
  managedAccounts: ["managed_accounts", "portfolio_managed_accounts"],
  investmentPlans: ["investment_plans", "plans"],
  profitHistory: ["profit_history", "user_profit_history"],
  profiles: ["profiles", "user_profiles"],
  referrals: ["referrals", "user_referrals"],
  support: ["support_tickets", "support"],
  settings: ["manage_schema", "settings"],
  paymentSettings: ["payment_methods"],
  withdrawalSettings: ["payment_methods"],
  transactions: ["transactions", "wallet_transactions"],
};

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  return { url, serviceRoleKey, anonKey };
}

export function getSupabaseClient({ useServiceRole = true } = {}) {
  const { url, serviceRoleKey, anonKey } = getSupabaseConfig();
  const key = useServiceRole ? serviceRoleKey : anonKey;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function requireAdmin(request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

  if (!token) {
    return { error: Response.json({ error: "Authentication required" }, { status: 401 }) };
  }

  const authClient = getSupabaseClient({ useServiceRole: false });
  const adminClient = getSupabaseClient({ useServiceRole: true });
  if (!authClient || !adminClient) {
    return { error: Response.json({ error: "Admin authentication is not configured" }, { status: 503 }) };
  }

  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) {
    return { error: Response.json({ error: "Invalid authentication token" }, { status: 401 }) };
  }

  if (authData.user.app_metadata?.role === "admin") return { user: authData.user };

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { error: Response.json({ error: "Admin access required" }, { status: 403 }) };
  }

  return { user: authData.user };
}

const workflowStatuses = {
  deposits: ["pending", "confirmed", "rejected"],
  withdrawals: ["pending", "processing", "approved", "rejected"],
  swaps: ["pending", "completed", "failed"],
  managedAccounts: ["active", "review", "paused"],
  support: ["open", "pending", "resolved", "closed"],
};

export function validateAdminPayload(section, payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("A JSON object is required");
  }

  const statusOptions = workflowStatuses[section];
  if (payload.status !== undefined && statusOptions && !statusOptions.includes(String(payload.status))) {
    throw new Error(`Invalid status for ${section}`);
  }

  if (["paymentSettings", "withdrawalSettings"].includes(section)) {
    const expectedDestination = getSectionDestination(section);
    const sourceDestination = payload.destination !== undefined ? String(payload.destination).toLowerCase() : expectedDestination;
    const resolvedDestination = sourceDestination === "both" ? expectedDestination : sourceDestination;

    if (!resolvedDestination || resolvedDestination !== expectedDestination) {
      throw new Error(`This ${section === "paymentSettings" ? "payment detail" : "withdrawal method"} must be saved as ${expectedDestination}.`);
    }

    payload.destination = resolvedDestination;
  }

  if (["deposits", "withdrawals", "swaps"].includes(section) && payload.amount !== undefined) {
    const amount = Number(String(payload.amount).replace(/[$,]/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be greater than zero");
  }

  return payload;
}

export async function logAdminEvent({ userId, action, section, recordId, metadata = {} }) {
  const supabase = getSupabaseClient({ useServiceRole: true });
  if (!supabase) return;

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: userId,
    action,
    section,
    record_id: recordId ? String(recordId) : null,
    metadata,
  });

  if (error) console.error(JSON.stringify({ event: "admin_audit_log_error", message: error.message, section, action }));
}

const operationalActions = {
  deposits: { confirm: "confirmed", reject: "rejected" },
  withdrawals: { process: "processing", approve: "approved", reject: "rejected" },
  swaps: { complete: "completed", fail: "failed" },
  managedAccounts: { activate: "active", review: "review", pause: "paused" },
  investments: { activate: "active", complete: "completed", cancel: "cancelled" },
  profitHistory: { settle: "settled", reopen: "pending" },
  referrals: { activate: "active", deactivate: "inactive" },
  support: { resolve: "resolved", close: "closed", reopen: "open" },
};

export async function executeOperationalAction({ section, id, action, userId }) {
  const targetStatus = operationalActions[section]?.[action];
  if (!targetStatus) throw new Error(`Action '${action}' is not available for ${section}`);

  const supabase = getSupabaseClient({ useServiceRole: true });
  if (!supabase) {
    if (section === "deposits" && action === "confirm") {
      throw new Error("Deposit confirmation is unavailable because Supabase is not configured.");
    }
    await logAdminEvent({ userId, action, section, recordId: id, metadata: { status: targetStatus, demo: true } });
    return { id, status: targetStatus, demo: true };
  }

  const table = getTableNames(section)[0] || section;
  const { data: current, error: readError } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (readError) throw new Error(readError.message || "Unable to load operational record");
  if (!current) throw new Error("Operational record not found");

  const terminalStatuses = ["approved", "confirmed", "completed", "cancelled", "rejected", "failed", "settled", "closed"];
  if (!(section === "deposits" && action === "confirm" && current.status === "confirmed")
    && terminalStatuses.includes(String(current.status).toLowerCase()) && current.status !== targetStatus) {
    throw new Error(`Record is already in terminal status '${current.status}'`);
  }

  if (section === "deposits" && action === "confirm") {
    const alreadyCredited = current.status === "confirmed"
      && current.credited_amount
      && current.credited_currency
      && current.exchange_rate;
    let creditCurrency;
    let creditAmount;
    let exchangeRate;
    let rateQuotedAt;

    if (alreadyCredited) {
      creditCurrency = String(current.credited_currency).trim().toUpperCase();
      creditAmount = Number(current.credited_amount);
      exchangeRate = Number(current.exchange_rate);
      rateQuotedAt = current.exchange_rate_quoted_at;
    } else {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("currency")
        .eq("id", current.user_id)
        .maybeSingle();
      if (profileError) throw new Error(profileError.message || "Unable to load the customer's account currency.");

      creditCurrency = String(profile?.currency || "USD").trim().toUpperCase();
      const quote = await getDepositExchangeRate(current.currency, creditCurrency);
      const fractionDigits = getCurrencyFractionDigits(creditCurrency);
      creditAmount = Number((Number(current.amount) * quote.rate).toFixed(fractionDigits));
      if (!Number.isFinite(creditAmount) || creditAmount <= 0) {
        throw new Error("The converted deposit amount is invalid and cannot be credited.");
      }
      exchangeRate = quote.rate;
      rateQuotedAt = quote.quotedAt;
    }

    const confirmFunction = current.purpose === "managed_account"
      ? "confirm_managed_account_deposit"
      : "confirm_deposit";
    const { data: confirmed, error: confirmError } = await supabase.rpc(confirmFunction, {
      p_deposit_id: id,
      p_credited_amount: creditAmount,
      p_credited_currency: creditCurrency,
      p_exchange_rate: exchangeRate,
      p_exchange_rate_quoted_at: rateQuotedAt,
    });
    if (confirmError) throw new Error(confirmError.message || "Unable to confirm and credit this deposit");
    await logAdminEvent({
      userId,
      action,
      section,
      recordId: id,
      metadata: {
        previousStatus: current.status,
        status: confirmed.status,
        amount: current.amount,
        currency: current.currency,
        creditedAmount: creditAmount,
        creditedCurrency: creditCurrency,
        exchangeRate,
        rateQuotedAt,
        purpose: current.purpose || "standard",
      },
    });
    return confirmed;
  }

  if (section === "withdrawals" && action === "approve") {
    const { data: approved, error: approvalError } = await supabase.rpc("confirm_withdrawal_payout", {
      p_withdrawal_id: id,
    });
    if (approvalError) throw new Error(approvalError.message || "Unable to confirm that the manual withdrawal payout was sent.");
    await logAdminEvent({
      userId,
      action,
      section,
      recordId: id,
      metadata: {
        previousStatus: current.status,
        status: approved.status,
        amount: current.amount,
        currency: current.currency,
        method: current.method,
      },
    });
    return approved;
  }

  if (section === "withdrawals" && action === "reject") {
    const { data: rejected, error: rejectionError } = await supabase.rpc("reject_withdrawal_request", {
      p_withdrawal_id: id,
    });
    if (rejectionError) throw new Error(rejectionError.message || "Unable to reject this withdrawal request.");
    await logAdminEvent({
      userId,
      action,
      section,
      recordId: id,
      metadata: {
        previousStatus: current.status,
        status: rejected.status,
        amount: current.amount,
        currency: current.currency,
        method: current.method,
      },
    });
    return rejected;
  }

  if (section === "investments") {
    const { data: reviewed, error: reviewError } = await supabase.rpc("review_funded_investment", {
      p_investment_id: id,
      p_action: action,
    });
    if (reviewError) throw new Error(reviewError.message || "Unable to apply this investment review action");
    await logAdminEvent({
      userId,
      action,
      section,
      recordId: id,
      metadata: {
        previousStatus: current.status,
        status: reviewed.status,
        fundingAmount: current.funding_amount,
        fundingCurrency: current.funding_currency,
      },
    });
    return reviewed;
  }

  if (section === "profitHistory" && action === "settle") {
    const { data: settled, error: settleError } = await supabase.rpc("settle_profit_history", {
      p_profit_history_id: id,
    });
    if (settleError) throw new Error(settleError.message || "Unable to credit this profit to the customer's balance.");
    await logAdminEvent({
      userId,
      action,
      section,
      recordId: id,
      metadata: {
        previousStatus: current.status,
        status: settled.status,
        amount: settled.profit,
        currency: settled.currency,
        customerId: settled.user_id,
      },
    });
    return settled;
  }

  if (section === "swaps") {
    const { data: reviewed, error: reviewError } = await supabase.rpc("review_customer_wallet_swap", {
      p_swap_id: id,
      p_action: action,
    });
    if (reviewError) throw new Error(reviewError.message || "Unable to review this wallet swap.");
    await logAdminEvent({
      userId,
      action,
      section,
      recordId: id,
      metadata: { previousStatus: current.status, status: reviewed.status, txHash: current.tx_hash },
    });
    return reviewed;
  }

  const updatePayload = section === "managedAccounts" && ["activate", "review"].includes(action)
    ? { status: targetStatus, review_requested_at: null }
    : { status: targetStatus };
  const { data: updated, error: updateError } = await supabase.from(table).update(updatePayload).eq("id", id).eq("status", current.status).select().single();
  if (updateError) throw new Error(updateError.message || "Unable to apply operational action");

  if (section === "withdrawals" && action === "approve") await supabase.from("transactions").insert({ user_id: current.user_id, amount: current.amount, type: "withdrawal", status: "completed" });

  await logAdminEvent({ userId, action, section, recordId: id, metadata: { previousStatus: current.status, status: targetStatus } });
  return updated;
}

export function getSectionDestination(section) {
  if (section === "paymentSettings") return "deposit";
  if (section === "withdrawalSettings") return "withdrawal";
  return null;
}

export function getTableNames(section) {
  return tableMap[section] || [section];
}

function toDatabasePayload(section, payload) {
  if (section !== "customers") return payload;
  const { firstName, lastName, ...rest } = payload;
  if (firstName !== undefined) rest.first_name = firstName;
  if (lastName !== undefined) rest.last_name = lastName;
  return rest;
}

function toAdminRecord(section, record) {
  if (section === "customers") {
    return {
      ...record,
      firstName: record.first_name || "",
      lastName: record.last_name || "",
    };
  }
  if (section === "profiles") {
    const fullName = [record.first_name, record.last_name].filter(Boolean).join(" ");
    return {
      ...record,
      user: fullName || record.email || record.id || "-",
      fullName,
    };
  }
  return record;
}

async function toAdminUserRecords(records, supabase) {
  const userIds = [...new Set(records.map((record) => record.user_id).filter(Boolean))];
  const profilesById = new Map();

  if (userIds.length) {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, currency")
      .in("id", userIds);
    if (error) throw new Error(error.message || "Unable to load customer details.");
    for (const profile of profiles || []) profilesById.set(profile.id, profile);
  }

  return records.map((record) => {
    const profile = profilesById.get(record.user_id);
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
    const userName = fullName || profile?.email || record.user_id || "-";
    return {
      ...record,
      user: userName,
      userName,
      currency: record.currency || profile?.currency || null,
      ...(record.from_asset !== undefined ? { fromAsset: record.from_asset } : {}),
      ...(record.to_asset !== undefined ? { toAsset: record.to_asset } : {}),
      ...(record.tx_hash !== undefined ? { txHash: record.tx_hash } : {}),
      ...(record.from_chain_id !== undefined ? { fromChainId: record.from_chain_id } : {}),
      ...(record.to_chain_id !== undefined ? { toChainId: record.to_chain_id } : {}),
      ...(record.from_amount !== undefined ? { fromAmount: record.from_amount } : {}),
      ...(record.to_amount !== undefined ? { toAmount: record.to_amount } : {}),
      ...(record.referrals_count !== undefined ? { referrals: record.referrals_count } : {}),
    };
  });
}

async function toAdminKycRecords(records, supabase) {
  const userIds = [...new Set(records.map((record) => record.user_id).filter(Boolean))];
  const profilesById = new Map();

  if (userIds.length) {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .in("id", userIds);
    if (error) throw new Error(error.message || "Unable to load customer details for KYC requests.");
    for (const profile of profiles || []) profilesById.set(profile.id, profile);
  }

  return Promise.all(records.map(async (record) => {
    let metadata = {};
    try {
      metadata = JSON.parse(record.notes || "{}");
    } catch {
      metadata = {};
    }

    let documentUrl = "";
    if (metadata.documentPath) {
      const { data, error } = await supabase.storage
        .from("kyc-documents")
        .createSignedUrl(metadata.documentPath, 60 * 60);
      if (error) throw new Error(error.message || "Unable to create a secure link to a KYC document.");
      documentUrl = data.signedUrl;
    }

    const profile = profilesById.get(record.user_id);
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || metadata.fullName || "";
    return {
      ...record,
      userName: fullName || profile?.email || record.user_id || "-",
      email: profile?.email || "-",
      documentType: record.document_type || "",
      documentUrl,
    };
  }));
}

async function toAdminDepositRecords(records, supabase) {
  const userIds = [...new Set(records.map((record) => record.user_id).filter(Boolean))];
  const depositIds = records.map((record) => record.id).filter(Boolean);
  const profilesById = new Map();
  const fundsByDepositId = new Map();

  if (userIds.length) {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .in("id", userIds);
    if (error) throw new Error(error.message || "Unable to load customer details for deposit requests.");
    for (const profile of profiles || []) profilesById.set(profile.id, profile);
  }

  if (depositIds.length) {
    const { data: funds, error } = await supabase
      .from("user_funds")
      .select("deposit_id, balance, currency")
      .in("deposit_id", depositIds);
    if (error) throw new Error(error.message || "Unable to load credited deposit balances.");
    for (const fund of funds || []) fundsByDepositId.set(fund.deposit_id, fund);
  }

  return records.map((record) => {
    const profile = profilesById.get(record.user_id);
    const fund = fundsByDepositId.get(record.id);
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
    return {
      ...record,
      user: fullName || profile?.email || record.user_id || "-",
      isCredited: Boolean(fund),
      creditedAmount: fund?.balance ?? null,
      creditedCurrency: fund?.currency || null,
    };
  });
}

async function toAdminInvestmentRecords(records, supabase) {
  const userIds = [...new Set(records.map((record) => record.user_id).filter(Boolean))];
  const profilesById = new Map();

  if (userIds.length) {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .in("id", userIds);
    if (error) throw new Error(error.message || "Unable to load customer details for investments.");
    for (const profile of profiles || []) profilesById.set(profile.id, profile);
  }

  return records.map((record) => {
    const profile = profilesById.get(record.user_id);
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
    return {
      ...record,
      userName: fullName || profile?.email || record.user_id || "-",
    };
  });
}

async function toAdminWithdrawalRecords(records, supabase) {
  const userIds = [...new Set(records.map((record) => record.user_id).filter(Boolean))];
  const profilesById = new Map();

  if (userIds.length) {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .in("id", userIds);
    if (error) throw new Error(error.message || "Unable to load customer details for withdrawal requests.");
    for (const profile of profiles || []) profilesById.set(profile.id, profile);
  }

  return records.map((record) => {
    const profile = profilesById.get(record.user_id);
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
    return {
      ...record,
      user: fullName || profile?.email || record.user_id || "-",
    };
  });
}

export async function fetchSupabaseRecords(section) {
  const supabase = getSupabaseClient({ useServiceRole: true });
  if (!supabase) {
    return ["paymentSettings", "withdrawalSettings"].includes(section) ? fallbackData[section] || [] : [];
  }

  const candidates = getTableNames(section);
  const expectedDestination = getSectionDestination(section);

  for (const table of candidates) {
    const { data, error } = await supabase.from(table).select("*");

    if (error) {
      if (error.code === "PGRST205" || error.status === 404) continue;
      throw new Error(error.message || `Unable to load ${section} records.`);
    }

    const records = data ?? [];
    const filtered = expectedDestination
      ? records.filter((record) => String(record.destination || "").toLowerCase() === expectedDestination)
      : records;

    if (section === "customers") {
      return filtered.filter((record) => record.role !== "deleted").map((record) => toAdminRecord(section, record));
    }
    if (section === "profiles") return filtered.map((record) => toAdminRecord(section, record));
    if (section === "kyc") return toAdminKycRecords(filtered, supabase);
    if (section === "deposits") return toAdminDepositRecords(filtered, supabase);
    if (section === "withdrawals") return toAdminWithdrawalRecords(filtered, supabase);
    if (section === "investments") return toAdminInvestmentRecords(filtered, supabase);
    if (["transactions", "userFunds", "swaps", "managedAccounts", "profitHistory", "referrals"].includes(section)) {
      return toAdminUserRecords(filtered, supabase);
    }
    return filtered;
  }

  return ["paymentSettings", "withdrawalSettings"].includes(section) ? fallbackData[section] || [] : [];
}

export async function insertSupabaseRecord(section, payload) {
  if (section === "profitHistory") {
    throw new Error("Use the profit credit workflow to select a customer and credit their balance.");
  }

  const supabase = getSupabaseClient({ useServiceRole: true });
  if (!supabase) {
    return { ...payload, id: Date.now() };
  }

  const table = getTableNames(section)[0] || section;
  const normalizedPayload = ["paymentSettings", "withdrawalSettings"].includes(section)
    ? { ...payload, destination: getSectionDestination(section) }
    : payload;

  const { data, error } = await supabase.from(table).insert(toDatabasePayload(section, normalizedPayload)).select().single();

  if (error) {
    throw new Error(error.message || "Unable to create record");
  }

  return data;
}

export async function updateSupabaseRecord(section, id, payload) {
  if (section === "profitHistory") {
    throw new Error("Profit records are financial ledger entries and cannot be edited.");
  }

  const supabase = getSupabaseClient({ useServiceRole: true });
  if (!supabase) {
    return { ...payload, id };
  }

  const table = getTableNames(section)[0] || section;
  const normalizedPayload = ["paymentSettings", "withdrawalSettings"].includes(section)
    ? { ...payload, destination: getSectionDestination(section) }
    : payload;

  const { data, error } = await supabase.from(table).update(toDatabasePayload(section, normalizedPayload)).eq("id", id).select().single();

  if (error) {
    throw new Error(error.message || "Unable to update record");
  }

  return data;
}

export async function deleteSupabaseRecord(section, id) {
  const supabase = getSupabaseClient({ useServiceRole: true });
  if (!supabase) {
    return true;
  }

  if (section === "customers") {
    const { data: profile, error: readError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", id)
      .maybeSingle();
    if (readError) throw new Error(readError.message || "Unable to load customer");
    if (!profile) return false;
    if (profile.role === "admin") throw new Error("Admin accounts cannot be removed from customer management");

    const { error: authError } = await supabase.auth.admin.deleteUser(id, true);
    if (authError) throw new Error(authError.message || "Unable to disable customer sign-in");

    const { error: anonymizeError } = await supabase
      .from("profiles")
      .update({
        email: `deleted+${id}@privacy.invalid`,
        first_name: "Deleted",
        last_name: "User",
        country: null,
        country_code: null,
        phone: null,
        role: "deleted",
      })
      .eq("id", id);
    if (anonymizeError) throw new Error(anonymizeError.message || "Unable to anonymize customer details");
    return true;
  }

  const table = getTableNames(section)[0] || section;
  const expectedDestination = getSectionDestination(section);

  if (expectedDestination) {
    const { data: existing, error: readError } = await supabase
      .from(table)
      .select("id, destination")
      .eq("id", id)
      .maybeSingle();

    if (readError) throw new Error(readError.message || "Unable to load record");
    if (!existing) return false;

    if (String(existing.destination || "").toLowerCase() !== expectedDestination) {
      throw new Error(`This record is not configured for ${section}.`);
    }
  }

  const { error } = await supabase.from(table).delete().eq("id", id);

  return !error;
}

export async function getAdminStats() {
  const supabase = getSupabaseClient({ useServiceRole: true });
  if (!supabase) return { totalUsers: 0, totalRevenue: 0, activeInvestments: 0, pendingKyc: 0, usersChange: 0, revenueChange: 0, investmentsChange: 0, kycChange: 0 };

  try {
    const [customers, investments, kyc, transactions] = await Promise.all([
      supabase.from("profiles").select("id").neq("role", "deleted"),
      supabase.from("investments").select("*"),
      supabase.from("kyc").select("*"),
      supabase.from("transactions").select("*"),
    ]);

    const customerData = customers.data || [];
    const investmentData = investments.data || [];
    const kycData = kyc.data || [];
    const txData = transactions.data || [];

    return {
      totalUsers: customerData.length,
      totalRevenue: txData.reduce((sum, tx) => sum + Number((tx.amount || "$0").toString().replace(/[$,]/g, "") || 0), 0),
      activeInvestments: investmentData.filter((item) => (item.status || "").toLowerCase() === "active").length,
      pendingKyc: kycData.filter((item) => (item.status || "").toLowerCase() !== "approved").length,
      usersChange: 0,
      revenueChange: 0,
      investmentsChange: 0,
      kycChange: 0,
    };
  } catch {
    return { totalUsers: 0, totalRevenue: 0, activeInvestments: 0, pendingKyc: 0, usersChange: 0, revenueChange: 0, investmentsChange: 0, kycChange: 0 };
  }
}

export async function getAdminTransactions() {
  const supabase = getSupabaseClient({ useServiceRole: true });
  if (!supabase) return [];

  const { data, error } = await supabase.from("transactions").select("*");
  if (error) throw new Error(error.message || "Unable to load transactions.");
  return toAdminUserRecords(Array.isArray(data) ? data : [], supabase);
}

export async function createAdminProfitCredit({ userId, amount, period, requestId, adminId }) {
  const supabase = getSupabaseClient({ useServiceRole: true });
  if (!supabase) throw new Error("Profit credits are unavailable because Supabase is not configured.");

  const { data, error } = await supabase.rpc("credit_investment_profit", {
    p_user_id: userId,
    p_amount: amount,
    p_period: period,
    p_request_id: requestId,
  });
  if (error) throw Object.assign(new Error(error.message || "Unable to credit investment profit."), { code: error.code });

  await logAdminEvent({
    userId: adminId,
    action: "credit",
    section: "profitHistory",
    recordId: data.id,
    metadata: {
      customerId: userId,
      amount: data.profit,
      currency: data.currency,
      period: data.period,
      status: data.status,
    },
  });
  return data;
}

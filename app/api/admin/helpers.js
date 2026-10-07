import { createClient } from "@supabase/supabase-js";

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
    await logAdminEvent({ userId, action, section, recordId: id, metadata: { status: targetStatus, demo: true } });
    return { id, status: targetStatus, demo: true };
  }

  const table = getTableNames(section)[0] || section;
  const { data: current, error: readError } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (readError) throw new Error(readError.message || "Unable to load operational record");
  if (!current) throw new Error("Operational record not found");

  const terminalStatuses = ["approved", "confirmed", "completed", "cancelled", "rejected", "failed", "settled", "closed"];
  if (terminalStatuses.includes(String(current.status).toLowerCase()) && current.status !== targetStatus) {
    throw new Error(`Record is already in terminal status '${current.status}'`);
  }

  const { data: updated, error: updateError } = await supabase.from(table).update({ status: targetStatus }).eq("id", id).eq("status", current.status).select().single();
  if (updateError) throw new Error(updateError.message || "Unable to apply operational action");

  if (section === "deposits" && action === "confirm") await supabase.from("transactions").insert({ user_id: current.user_id, amount: current.amount, type: "deposit", status: "completed" });
  if (section === "withdrawals" && action === "approve") await supabase.from("transactions").insert({ user_id: current.user_id, amount: current.amount, type: "withdrawal", status: "completed" });
  if (section === "profitHistory" && action === "settle") await supabase.from("transactions").insert({ user_id: current.user_id, amount: current.profit, type: "bonus", status: "completed" });

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
  if (section !== "customers") return record;
  return {
    ...record,
    firstName: record.first_name || "",
    lastName: record.last_name || "",
  };
}

export async function fetchSupabaseRecords(section) {
  const supabase = getSupabaseClient({ useServiceRole: true });
  if (!supabase) {
    return ["paymentSettings", "withdrawalSettings"].includes(section) ? fallbackData[section] || [] : [];
  }

  const candidates = getTableNames(section);
  const expectedDestination = getSectionDestination(section);

  for (const table of candidates) {
    try {
      const { data, error } = await supabase.from(table).select("*");

      if (error) {
        if (error.code === "PGRST205" || error.status === 404) continue;
        continue;
      }

      const records = data ?? [];
      const filtered = expectedDestination
        ? records.filter((record) => String(record.destination || "").toLowerCase() === expectedDestination)
        : records;

      return section === "customers"
        ? filtered.filter((record) => record.role !== "deleted").map((record) => toAdminRecord(section, record))
        : filtered;
    } catch {
      continue;
    }
  }

  return ["paymentSettings", "withdrawalSettings"].includes(section) ? fallbackData[section] || [] : [];
}

export async function insertSupabaseRecord(section, payload) {
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

  try {
    const { data, error } = await supabase.from("transactions").select("*");
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

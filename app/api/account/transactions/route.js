import { createClient } from "@supabase/supabase-js";

function createSupabaseClient(key) {
  const url = process.env.SUPABASE_URL;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function GET(request) {
  const authClient = createSupabaseClient(process.env.SUPABASE_ANON_KEY);
  const serviceClient = createSupabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!authClient || !serviceClient) {
    return Response.json({ error: "Account history is not configured." }, { status: 503 });
  }

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!accessToken) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return Response.json({ error: "Your session is invalid or expired. Sign in again." }, { status: 401 });
  }

  try {
    const userId = authData.user.id;
    const [depositsResult, withdrawalsResult, transactionsResult, fundsResult, profitsResult, investmentsResult] = await Promise.all([
      serviceClient
        .from("deposits")
        .select("id, amount, currency, method, network, reference, purpose, status, credited_amount, credited_currency, exchange_rate, exchange_rate_quoted_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("withdrawals")
        .select("id, amount, currency, method, asset, network, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("transactions")
        .select("id, amount, type, status, currency, deposit_id, withdrawal_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("user_funds")
        .select("balance, currency, type, status, deposit_id")
        .eq("user_id", userId)
        .eq("status", "available"),
      serviceClient
        .from("profit_history")
        .select("id, period, profit, currency, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      serviceClient
        .from("investments")
        .select("id, plan_id, plan, amount, status, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    for (const result of [depositsResult, withdrawalsResult, transactionsResult, fundsResult, profitsResult, investmentsResult]) {
      if (result.error) throw new Error(result.error.message || "Unable to load account history.");
    }

    const planIds = [...new Set((investmentsResult.data || []).map(investment => investment.plan_id).filter(Boolean))];
    let plansById = new Map();
    if (planIds.length) {
      const { data: plans, error: plansError } = await serviceClient
        .from("investment_plans")
        .select("id, roi, duration_days")
        .in("id", planIds);
      if (plansError) throw new Error(plansError.message || "Unable to load investment plan details.");
      plansById = new Map((plans || []).map(plan => [plan.id, plan]));
    }

    const profitHistory = (profitsResult.data || []).map(profit => ({
      id: profit.id,
      period: profit.period || "Investment profit",
      profit: Number(profit.profit) || 0,
      currency: String(profit.currency || "USD").trim().toUpperCase(),
      status: profit.status || "pending",
      createdAt: profit.created_at,
    }));
    const profitByCurrency = new Map();
    for (const profit of profitHistory) {
      if (profit.status !== "settled") continue;
      profitByCurrency.set(profit.currency, (profitByCurrency.get(profit.currency) || 0) + profit.profit);
    }
    const investmentProfit = [...profitByCurrency.entries()]
      .map(([currency, amount]) => ({ currency, amount }))
      .sort((left, right) => left.currency.localeCompare(right.currency));
    const investments = (investmentsResult.data || []).map(investment => {
      const plan = plansById.get(investment.plan_id);
      const durationDays = Number(plan?.duration_days) || 0;
      const createdAt = investment.created_at;
      const startDate = String(investment.status || "").toLowerCase() === "active"
        ? investment.updated_at || createdAt
        : createdAt;
      const maturityDate = startDate && durationDays > 0
        ? new Date(new Date(startDate).getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;
      return {
        id: investment.id,
        plan: investment.plan || "Investment",
        amount: Number(investment.amount) || 0,
        status: String(investment.status || "pending").toLowerCase(),
        roi: Number(plan?.roi) || 0,
        createdAt,
        maturityDate,
      };
    });
    const lockedBalanceUsd = investments
      .filter(investment => investment.status === "pending" || investment.status === "active")
      .reduce((total, investment) => total + investment.amount, 0);
    const nextPayout = investments
      .filter(investment => investment.status === "active" && investment.maturityDate)
      .sort((left, right) => new Date(left.maturityDate).getTime() - new Date(right.maturityDate).getTime())[0]?.maturityDate || null;

    const fundsByDepositId = new Map(
      (fundsResult.data || []).filter(fund => fund.deposit_id).map(fund => [fund.deposit_id, fund]),
    );
    const transactionsByDepositId = new Map(
      (transactionsResult.data || [])
        .filter(transaction => transaction.type === "deposit" && transaction.deposit_id)
        .map(transaction => [transaction.deposit_id, transaction]),
    );
    const transactionsByWithdrawalId = new Map(
      (transactionsResult.data || [])
        .filter(transaction => transaction.type === "withdrawal" && transaction.withdrawal_id)
        .map(transaction => [transaction.withdrawal_id, transaction]),
    );
    const deposits = (depositsResult.data || []).map(deposit => {
      const fund = fundsByDepositId.get(deposit.id);
      const transaction = transactionsByDepositId.get(deposit.id);
      return {
        id: `deposit-${deposit.id}`,
        transactionId: transaction?.id || null,
        amount: deposit.amount,
        currency: deposit.currency || "—",
        method: deposit.method || "Deposit",
        network: deposit.network || null,
        reference: deposit.reference || null,
        purpose: deposit.purpose || "standard",
        type: "deposit",
        status: deposit.status,
        creditedAmount: deposit.credited_amount ?? fund?.balance ?? null,
        creditedCurrency: deposit.credited_currency || fund?.currency || null,
        exchangeRate: deposit.exchange_rate ?? null,
        exchangeRateQuotedAt: deposit.exchange_rate_quoted_at || null,
        createdAt: deposit.created_at,
      };
    });
    const withdrawals = (withdrawalsResult.data || []).map(withdrawal => ({
      id: `withdrawal-${withdrawal.id}`,
      requestId: withdrawal.id,
      transactionId: transactionsByWithdrawalId.get(withdrawal.id)?.id || null,
      amount: withdrawal.amount,
      currency: withdrawal.currency || "—",
      method: withdrawal.method || "Withdrawal",
      asset: withdrawal.asset || null,
      network: withdrawal.network || null,
      type: "withdrawal",
      status: withdrawal.status,
      createdAt: withdrawal.created_at,
    }));
    const transactions = (transactionsResult.data || [])
      .filter(transaction => transaction.type !== "deposit" && transaction.type !== "withdrawal")
      .map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      currency: transaction.currency || "—",
      type: transaction.type,
      status: transaction.status,
      creditedAmount: transaction.type === "deposit" ? transaction.amount : null,
      creditedCurrency: transaction.type === "deposit" ? transaction.currency : null,
      createdAt: transaction.created_at,
      }));
    const funds = fundsResult.data || [];
    const availableBalancesByCurrency = funds.reduce((balances, fund) => {
      const amount = Number(fund.balance) || 0;
      const currency = String(fund.currency || "").trim().toUpperCase();
      if (!currency) return balances;
      const balance = balances.get(currency) || 0;
      if (fund.type === "withdrawal" || fund.type === "investment") balances.set(currency, balance - amount);
      if (fund.type === "deposit" || fund.type === "bonus" || fund.type === "investment_refund") balances.set(currency, balance + amount);
      return balances;
    }, new Map());
    const availableBalances = [...availableBalancesByCurrency.entries()]
      .map(([currency, amount]) => ({ currency, amount }))
      .filter(balance => balance.amount !== 0)
      .sort((left, right) => left.currency.localeCompare(right.currency));
    const data = [...deposits, ...withdrawals, ...transactions]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 100);

    return Response.json(
      { data, availableBalances, investmentProfit, profitHistory, investments, lockedBalanceUsd, nextPayout },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Unable to load customer account history:", error.message);
    return Response.json({ error: "Unable to load account history. Please try again later." }, { status: 500 });
  }
}

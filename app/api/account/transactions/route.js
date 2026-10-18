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
    return Response.json({ error: "Sign in to view your account history." }, { status: 401 });
  }

  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return Response.json({ error: "Your session is invalid or expired. Sign in again." }, { status: 401 });
  }

  try {
    const userId = authData.user.id;
    const [depositsResult, transactionsResult, fundsResult] = await Promise.all([
      serviceClient
        .from("deposits")
        .select("id, amount, currency, method, network, reference, status, credited_amount, credited_currency, exchange_rate, exchange_rate_quoted_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("transactions")
        .select("id, amount, type, status, currency, deposit_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("user_funds")
        .select("balance, currency, type, status, deposit_id")
        .eq("user_id", userId)
        .eq("status", "available"),
    ]);

    for (const result of [depositsResult, transactionsResult, fundsResult]) {
      if (result.error) throw new Error(result.error.message || "Unable to load account history.");
    }

    const fundsByDepositId = new Map(
      (fundsResult.data || []).filter(fund => fund.deposit_id).map(fund => [fund.deposit_id, fund]),
    );
    const transactionsByDepositId = new Map(
      (transactionsResult.data || [])
        .filter(transaction => transaction.type === "deposit" && transaction.deposit_id)
        .map(transaction => [transaction.deposit_id, transaction]),
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
        type: "deposit",
        status: deposit.status,
        creditedAmount: deposit.credited_amount ?? fund?.balance ?? null,
        creditedCurrency: deposit.credited_currency || fund?.currency || null,
        exchangeRate: deposit.exchange_rate ?? null,
        exchangeRateQuotedAt: deposit.exchange_rate_quoted_at || null,
        createdAt: deposit.created_at,
      };
    });
    const transactions = (transactionsResult.data || []).filter(transaction => transaction.type !== "deposit").map(transaction => ({
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
    const data = [...deposits, ...transactions]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 100);

    return Response.json(
      { data, availableBalances },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Unable to load customer account history:", error.message);
    return Response.json({ error: "Unable to load account history. Please try again later." }, { status: 500 });
  }
}

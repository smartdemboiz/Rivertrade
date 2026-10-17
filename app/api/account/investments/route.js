import { createClient } from "@supabase/supabase-js";

const currencyCoinIds = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  XRP: "ripple",
  DOGE: "dogecoin",
};

const currencyDecimals = {
  USD: 2,
  BTC: 8,
  ETH: 8,
  USDT: 6,
  BNB: 8,
  XRP: 6,
  DOGE: 8,
};

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

async function authenticate(request) {
  const authClient = createSupabaseClient(process.env.SUPABASE_ANON_KEY);
  const serviceClient = createSupabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!authClient || !serviceClient) {
    return { error: Response.json({ error: "Investment services are not configured." }, { status: 503 }) };
  }

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!accessToken) {
    return { error: Response.json({ error: "Sign in to manage investments." }, { status: 401 }) };
  }

  const { data, error } = await authClient.auth.getUser(accessToken);
  if (error || !data.user) {
    return { error: Response.json({ error: "Your session is invalid or expired. Sign in again." }, { status: 401 }) };
  }
  if (!data.user.email_confirmed_at) {
    return { error: Response.json({ error: "Verify your email before investing." }, { status: 403 }) };
  }

  return { user: data.user, serviceClient };
}

async function getAvailableBalances(supabase, userId) {
  const { data, error } = await supabase
    .from("user_funds")
    .select("balance, currency, type, status")
    .eq("user_id", userId)
    .eq("status", "available");

  if (error) throw new Error(error.message || "Unable to read available account balances.");

  const totals = new Map();
  for (const fund of data || []) {
    const currency = String(fund.currency || "").trim().toUpperCase();
    if (!currency) continue;
    const amount = Number(fund.balance) || 0;
    const current = totals.get(currency) || 0;
    if (fund.type === "deposit" || fund.type === "bonus" || fund.type === "investment_refund") {
      totals.set(currency, current + amount);
    } else if (fund.type === "withdrawal" || fund.type === "investment") {
      totals.set(currency, current - amount);
    }
  }

  return [...totals.entries()]
    .filter(([, amount]) => amount > 0)
    .map(([currency, amount]) => ({ currency, amount }))
    .sort((left, right) => left.currency.localeCompare(right.currency));
}

async function getUsdRate(currency) {
  if (currency === "USD") return 1;
  const coinId = currencyCoinIds[currency];
  if (!coinId) throw new Error(`Investments cannot currently be funded with ${currency}.`);

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error("Live conversion rates are temporarily unavailable. Please try again.");

  const data = await response.json();
  const rate = Number(data?.[coinId]?.usd);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`A valid USD rate is not available for ${currency}.`);
  }
  return rate;
}

function roundFundingAmount(amountUsd, rate, decimals) {
  const scale = 10 ** decimals;
  const rounded = Math.ceil((amountUsd / rate) * scale - Number.EPSILON) / scale;
  return rounded.toFixed(decimals);
}

export async function GET(request) {
  const authorization = await authenticate(request);
  if (authorization.error) return authorization.error;

  try {
    const [plansResult, availableBalances] = await Promise.all([
      authorization.serviceClient
        .from("investment_plans")
        .select("id, name, min_amount, max_amount, roi, duration_days")
        .eq("status", "active")
        .order("min_amount", { ascending: true }),
      getAvailableBalances(authorization.serviceClient, authorization.user.id),
    ]);

    if (plansResult.error) throw new Error(plansResult.error.message || "Unable to load investment plans.");

    const plans = (plansResult.data || []).map(plan => ({
      id: plan.id,
      name: plan.name,
      minimum: Number(plan.min_amount),
      maximum: plan.max_amount === null ? null : Number(plan.max_amount),
      roi: Number(plan.roi),
      durationDays: Number(plan.duration_days),
    }));

    return Response.json(
      { plans, availableBalances },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Unable to load investment options:", error.message);
    return Response.json({ error: "Unable to load investment options. Please try again later." }, { status: 500 });
  }
}

export async function POST(request) {
  const authorization = await authenticate(request);
  if (authorization.error) return authorization.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "A valid investment request is required." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "A valid investment request is required." }, { status: 400 });
  }

  const supabase = authorization.serviceClient;

  if (body.action === "quote") {
    const planId = typeof body.planId === "string" ? body.planId : "";
    const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : "";
    const amountString = String(body.amountUsd ?? "").trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planId)) {
      return Response.json({ error: "Select an active investment plan." }, { status: 400 });
    }
    if (!/^\d+(?:\.\d{1,2})?$/.test(amountString) || amountString.length > 32) {
      return Response.json({ error: "Enter a valid investment amount in USD." }, { status: 400 });
    }
    const amountUsd = Number(amountString);
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      return Response.json({ error: "Investment amount must be greater than zero." }, { status: 400 });
    }

    try {
      const { data: plan, error: planError } = await supabase
        .from("investment_plans")
        .select("id, min_amount, max_amount, status")
        .eq("id", planId)
        .maybeSingle();
      if (planError) throw new Error(planError.message || "Unable to validate the selected plan.");
      if (!plan || String(plan.status).toLowerCase() !== "active") {
        return Response.json({ error: "That investment plan is no longer active. Refresh and try again." }, { status: 409 });
      }
      if (amountUsd < Number(plan.min_amount) || (plan.max_amount !== null && amountUsd > Number(plan.max_amount))) {
        return Response.json({ error: "The investment amount is outside this plan's range." }, { status: 400 });
      }

      const availableBalances = await getAvailableBalances(supabase, authorization.user.id);
      const sourceBalance = availableBalances.find(balance => balance.currency === currency);
      if (!currencyDecimals[currency] && currency !== "USD") {
        return Response.json({ error: `Investments cannot currently be funded with ${currency || "that currency"}.` }, { status: 400 });
      }
      if (!sourceBalance || sourceBalance.amount <= 0) {
        return Response.json({ error: `No available ${currency} balance was found for this account.` }, { status: 400 });
      }

      const exchangeRateUsd = await getUsdRate(currency);
      const fundingAmount = roundFundingAmount(amountUsd, exchangeRateUsd, currencyDecimals[currency]);
      if (Number(fundingAmount) > sourceBalance.amount) {
        return Response.json({ error: `The available ${currency} balance is insufficient for this investment.` }, { status: 400 });
      }

      const expiresAt = new Date(Date.now() + 60_000).toISOString();
      const { data: quote, error: quoteError } = await supabase
        .from("investment_quotes")
        .insert({
          user_id: authorization.user.id,
          plan_id: plan.id,
          amount_usd: amountUsd,
          funding_currency: currency,
          funding_amount: fundingAmount,
          exchange_rate_usd: exchangeRateUsd,
          expires_at: expiresAt,
        })
        .select("id, amount_usd, funding_currency, funding_amount, exchange_rate_usd, expires_at")
        .single();
      if (quoteError) throw new Error(quoteError.message || "Unable to create an investment quote.");

      return Response.json({ quote }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      console.error("Unable to quote an investment:", error.message);
      return Response.json({ error: error.message || "Unable to quote this investment." }, { status: 502 });
    }
  }

  if (body.action === "confirm") {
    const quoteId = typeof body.quoteId === "string" ? body.quoteId : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quoteId)) {
      return Response.json({ error: "Request a valid investment quote before confirming." }, { status: 400 });
    }

    try {
      const { data, error } = await supabase.rpc("create_funded_investment", {
        p_quote_id: quoteId,
        p_user_id: authorization.user.id,
      });
      if (error) {
        const clientError = /expired|already been used|no longer active|outside the selected plan range|balance is insufficient|profile not found/i.test(error.message);
        return Response.json(
          { error: error.message || "Unable to confirm this investment." },
          { status: clientError ? 409 : 500 },
        );
      }
      return Response.json({ data }, { status: 201, headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      console.error("Unable to confirm an investment:", error.message);
      return Response.json({ error: "Unable to confirm this investment. Please try again." }, { status: 500 });
    }
  }

  return Response.json({ error: "Unsupported investment action." }, { status: 400 });
}

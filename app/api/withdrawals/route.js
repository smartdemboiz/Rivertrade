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

function normalizeDestinationDetails(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  if (!entries.length || entries.length > 10) return null;

  const details = {};
  for (const [key, rawValue] of entries) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(key) || typeof rawValue !== "string") return null;
    const trimmedValue = rawValue.trim();
    if (!trimmedValue || trimmedValue.length > 500) return null;
    details[key] = trimmedValue;
  }

  if (JSON.stringify(details).length > 2000) return null;
  return details;
}

export async function POST(request) {
  const authClient = createSupabaseClient(process.env.SUPABASE_ANON_KEY);
  const serviceClient = createSupabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!authClient || !serviceClient) {
    return Response.json({ error: "Withdrawal requests are not configured." }, { status: 503 });
  }

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!accessToken) {
    return Response.json({ error: "Sign in before submitting a withdrawal request." }, { status: 401 });
  }

  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return Response.json({ error: "Your session is invalid or expired. Sign in again." }, { status: 401 });
  }

  if (!authData.user.email_confirmed_at) {
    return Response.json({ error: "Verify your email address before submitting a withdrawal request." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "A valid withdrawal request is required." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "A valid withdrawal request is required." }, { status: 400 });
  }

  const amount = String(body.amount || "").trim();
  const method = typeof body.method === "string" ? body.method.trim() : "";
  const asset = typeof body.asset === "string" ? body.asset.trim() : "";
  const network = typeof body.network === "string" ? body.network.trim() : "";
  const destinationDetails = normalizeDestinationDetails(body.destinationDetails);

  if (!/^\d+(?:\.\d+)?$/.test(amount) || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || amount.length > 32) {
    return Response.json({ error: "Enter a valid withdrawal amount greater than zero." }, { status: 400 });
  }
  if (!method || method.length > 80 || asset.length > 100 || network.length > 100 || !destinationDetails) {
    return Response.json({ error: "Choose a valid withdrawal method and provide complete payout details." }, { status: 400 });
  }
  if (/\b(crypto|bitcoin|btc|ethereum|eth|tether|usdt|usdc|solana|bnb|xrp|doge|ada|link|ltc|bch|dot|avax)\b/i.test(`${method} ${asset}`)
    && (!destinationDetails.walletAddress || !destinationDetails.asset)) {
    return Response.json({ error: "Enter the destination wallet address and payout asset." }, { status: 400 });
  }
  if (/\b(bank|ach|wire|swift|sepa|transfer)\b/i.test(method)
    && (!destinationDetails.accountName || !destinationDetails.accountNumber || !destinationDetails.routingNumber || !destinationDetails.bankName)) {
    return Response.json({ error: "Enter the complete bank account details." }, { status: 400 });
  }
  if (/paypal/i.test(method)
    && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinationDetails.paypalEmail || "")) {
    return Response.json({ error: "Enter a valid PayPal email address." }, { status: 400 });
  }
  if (!/^(?:crypto|bitcoin|btc|ethereum|eth|tether|usdt|usdc|solana|bnb|xrp|doge|ada|link|ltc|bch|dot|avax|bank|ach|wire|swift|sepa|transfer|paypal)\b/i.test(method)
    && !destinationDetails.managedAccount
    && !destinationDetails.accountDetails) {
    return Response.json({ error: "Enter payout account details for this withdrawal method." }, { status: 400 });
  }

  try {
    const { data: paymentMethods, error: methodsError } = await serviceClient
      .from("payment_methods")
      .select("method, asset, network")
      .eq("method", method)
      .eq("enabled", true)
      .in("destination", ["withdrawal", "both"]);

    if (methodsError) throw new Error(methodsError.message || "Unable to validate the withdrawal method.");
    const selectedMethod = (paymentMethods || []).find(item =>
      (item.asset || "") === asset && (item.network || "") === network,
    );
    if (!selectedMethod) {
      return Response.json({ error: "That withdrawal method is no longer available. Refresh and choose another method." }, { status: 400 });
    }

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("currency")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message || "Unable to load the account currency.");
    if (!profile) return Response.json({ error: "Customer account not found." }, { status: 404 });

    const { data: withdrawal, error: requestError } = await serviceClient.rpc("create_withdrawal_request", {
      p_user_id: authData.user.id,
      p_amount: Number(amount),
      p_currency: String(profile.currency || "USD").trim().toUpperCase(),
      p_method: method,
      p_asset: asset,
      p_network: network,
      p_destination_details: destinationDetails,
    });

    if (requestError) {
      if (requestError.code === "22023") {
        return Response.json({ error: requestError.message }, { status: 400 });
      }
      throw new Error(requestError.message || "Unable to save your withdrawal request.");
    }

    return Response.json({ data: withdrawal }, { status: 201 });
  } catch (error) {
    console.error("Unable to submit withdrawal request:", error.message);
    return Response.json({ error: "Unable to save your withdrawal request. Please try again later." }, { status: 500 });
  }
}

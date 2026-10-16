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

export async function POST(request) {
  const authClient = createSupabaseClient(process.env.SUPABASE_ANON_KEY);
  const serviceClient = createSupabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!authClient || !serviceClient) {
    return Response.json({ error: "Deposit requests are not configured." }, { status: 503 });
  }

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!accessToken) {
    return Response.json({ error: "Sign in before submitting a deposit request." }, { status: 401 });
  }

  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return Response.json({ error: "Your session is invalid or expired. Sign in again." }, { status: 401 });
  }

  const user = authData.user;
  if (!user.email_confirmed_at || !user.email) {
    return Response.json({ error: "Verify your email address before submitting a deposit request." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "A valid deposit request is required." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "A valid deposit request is required." }, { status: 400 });
  }

  const amount = String(body.amount || "").trim();
  const method = typeof body.method === "string" ? body.method.trim() : "";
  const asset = typeof body.asset === "string" ? body.asset.trim() : "";
  const network = typeof body.network === "string" ? body.network.trim() : "";
  const reference = typeof body.reference === "string" ? body.reference.trim() : "";

  if (!/^\d+(?:\.\d+)?$/.test(amount) || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || amount.length > 32) {
    return Response.json({ error: "Enter a valid amount greater than zero." }, { status: 400 });
  }
  if (!method || method.length > 80) {
    return Response.json({ error: "Choose a valid deposit method." }, { status: 400 });
  }
  if (method === "Cryptocurrency" && (!asset || asset.length > 100 || !network || network.length > 100)) {
    return Response.json({ error: "Choose a cryptocurrency and network." }, { status: 400 });
  }
  if (method !== "Cryptocurrency" && (asset || network)) {
    return Response.json({ error: "Cryptocurrency details are not valid for this deposit method." }, { status: 400 });
  }
  if (method === "PayPal" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reference)) {
    return Response.json({ error: "Enter a valid PayPal email address." }, { status: 400 });
  }
  if (method !== "PayPal" && reference) {
    return Response.json({ error: "A payment reference is only valid for PayPal deposits." }, { status: 400 });
  }
  if (reference.length > 254) {
    return Response.json({ error: "The payment reference is too long." }, { status: 400 });
  }

  try {
    const { data: paymentMethods, error: methodsError } = await serviceClient
      .from("payment_methods")
      .select("method, asset, network")
      .eq("method", method)
      .eq("enabled", true)
      .in("destination", ["deposit", "both"]);

    if (methodsError) throw new Error(methodsError.message || "Unable to validate the deposit method.");
    const availableMethods = paymentMethods || [];
    const selectedMethod = method === "Cryptocurrency"
      ? availableMethods.find(item => item.asset === asset && item.network === network)
      : availableMethods[0];

    if (!selectedMethod) {
      return Response.json({ error: "That deposit method is no longer available. Refresh and choose another method." }, { status: 400 });
    }

    const metadata = user.user_metadata || {};
    const { error: profileError } = await serviceClient
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        first_name: metadata.first_name || "",
        last_name: metadata.last_name || "",
        country: metadata.country || null,
        country_code: metadata.country_code || null,
        phone: metadata.phone || null,
        currency: metadata.currency || "USD",
        role: "customer",
      }, { onConflict: "id", ignoreDuplicates: true });

    if (profileError) throw new Error(profileError.message || "Unable to prepare your customer profile.");

    const currency = method === "Cryptocurrency" ? asset : "USD";
    const { data: deposit, error: insertError } = await serviceClient
      .from("deposits")
      .insert({
        user_id: user.id,
        amount,
        currency,
        method,
        network: method === "Cryptocurrency" ? network : null,
        reference: reference || null,
        status: "pending",
      })
      .select("id, amount, currency, method, network, status, created_at")
      .single();

    if (insertError) throw new Error(insertError.message || "Unable to save your deposit request.");

    return Response.json({ data: deposit }, { status: 201 });
  } catch (error) {
    console.error("Unable to submit deposit request:", error.message);
    return Response.json({ error: "Unable to save your deposit request. Please try again later." }, { status: 500 });
  }
}

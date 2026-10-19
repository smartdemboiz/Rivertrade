import { createClient } from "@supabase/supabase-js";

const riskProfiles = new Set(["Conservative", "Balanced", "Aggressive"]);

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

async function authorize(request) {
  const authClient = createSupabaseClient(process.env.SUPABASE_ANON_KEY);
  const serviceClient = createSupabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!authClient || !serviceClient) {
    return { error: Response.json({ error: "Managed accounts are not configured." }, { status: 503 }) };
  }

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!accessToken) {
    return { error: Response.json({ error: "Sign in to access your managed account." }, { status: 401 }) };
  }

  const { data, error } = await authClient.auth.getUser(accessToken);
  if (error || !data.user) {
    return { error: Response.json({ error: "Your session is invalid or expired. Sign in again." }, { status: 401 }) };
  }
  return { user: data.user, serviceClient };
}

export async function GET(request) {
  const authorization = await authorize(request);
  if (authorization.error) return authorization.error;

  const { data, error } = await authorization.serviceClient
    .from("managed_accounts")
    .select("id, strategy, allocation, status, risk_profile, account_value, account_currency, total_return, monthly_return, management_fee, next_review_at, review_requested_at, created_at, updated_at")
    .eq("user_id", authorization.user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Unable to load customer managed account:", error.message);
    return Response.json({ error: "Unable to load your managed account." }, { status: 500 });
  }

  const { data: deposits, error: depositsError } = await authorization.serviceClient
    .from("deposits")
    .select("id, amount, currency, method, status, credited_amount, credited_currency, created_at")
    .eq("user_id", authorization.user.id)
    .eq("purpose", "managed_account")
    .order("created_at", { ascending: false })
    .limit(20);

  if (depositsError) {
    console.error("Unable to load managed-account funding requests:", depositsError.message);
    return Response.json({ error: "Unable to load managed-account funding requests." }, { status: 500 });
  }

  return Response.json({
    data: data?.[0] || null,
    fundingRequests: deposits || [],
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const authorization = await authorize(request);
  if (authorization.error) return authorization.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "A valid managed-account request is required." }, { status: 400 });
  }

  const action = typeof body?.action === "string" ? body.action : "";
  const riskProfile = typeof body?.riskProfile === "string" ? body.riskProfile : null;
  if (!["setup", "preferences", "review"].includes(action)
    || (action === "preferences" && !riskProfiles.has(riskProfile))) {
    return Response.json({ error: "Choose a valid managed-account action and risk profile." }, { status: 400 });
  }

  const { data, error } = await authorization.serviceClient.rpc("manage_customer_managed_account", {
    p_user_id: authorization.user.id,
    p_action: action,
    p_risk_profile: riskProfile,
  });

  if (error) {
    console.error("Unable to update customer managed account:", error.message);
    const status = error.code === "P0002" ? 404 : error.code === "22023" ? 400 : 500;
    return Response.json({ error: error.message || "Unable to update your managed account." }, { status });
  }

  return Response.json({ data }, { headers: { "Cache-Control": "no-store" } });
}

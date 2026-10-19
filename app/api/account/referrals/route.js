import { createClient } from "@supabase/supabase-js";

function createSupabaseClient(key) {
  const url = process.env.SUPABASE_URL;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function GET(request) {
  const authClient = createSupabaseClient(process.env.SUPABASE_ANON_KEY);
  const serviceClient = createSupabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!authClient || !serviceClient) {
    return Response.json({ error: "Referral service is not configured." }, { status: 503 });
  }

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return Response.json({ error: "Authentication required." }, { status: 401 });

  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) {
    return Response.json({ error: "Your session is invalid or expired. Sign in again." }, { status: 401 });
  }

  try {
    const { data: referralData, error: referralError } = await serviceClient.rpc(
      "ensure_customer_referral",
      { p_user_id: authData.user.id },
    );
    if (referralError) throw new Error(referralError.message || "Unable to load your referral code.");
    const referral = Array.isArray(referralData) ? referralData[0] : referralData;
    if (!referral?.code) throw new Error("Unable to create a referral code for this customer.");

    const { data: referredProfiles, error: profilesError } = await serviceClient
      .from("profiles")
      .select("id, role, created_at")
      .eq("referred_by", authData.user.id)
      .order("created_at", { ascending: false });
    if (profilesError) throw new Error(profilesError.message || "Unable to load referred signups.");

    const referrals = (referredProfiles || []).map(profile => ({
      id: profile.id,
      joinedAt: profile.created_at,
      status: profile.role === "customer" ? "active" : "inactive",
    }));
    return Response.json({
      data: {
        code: referral.code,
        total: referrals.length,
        active: referrals.filter(referralRecord => referralRecord.status === "active").length,
        referrals,
        commissionsEnabled: false,
        earnings: 0,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to load referral data:", error.message);
    return Response.json({ error: "Unable to load referral data right now." }, { status: 500 });
  }
}

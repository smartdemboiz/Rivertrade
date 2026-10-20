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
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message || "Unable to verify the customer profile.");
    if (!profile) return Response.json({ error: "Customer profile not found." }, { status: 404 });
    if (!["customer", "admin"].includes(profile.role)) {
      return Response.json({ error: "Referral links are available to customer and admin accounts." }, { status: 403 });
    }

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
    const [
      { data: commissionSettings, error: settingsError },
      { data: commissionRows, error: commissionsError },
    ] = await Promise.all([
      serviceClient
        .from("referral_commission_settings")
        .select("enabled, commission_rate, qualifying_activity, approval_required")
        .eq("singleton", true)
        .maybeSingle(),
      serviceClient
        .from("referral_commissions")
        .select("id, referred_user_id, deposit_id, amount, currency, commission_rate, status, created_at, reviewed_at")
        .eq("referrer_id", authData.user.id)
        .order("created_at", { ascending: false }),
    ]);
    if (settingsError) throw new Error(settingsError.message || "Unable to load referral commission settings.");
    if (commissionsError) throw new Error(commissionsError.message || "Unable to load referral commissions.");

    const commissionTotals = (status) => (commissionRows || [])
      .filter(commission => commission.status === status)
      .reduce((totals, commission) => {
        const currency = String(commission.currency || "USD").toUpperCase();
        totals[currency] = (totals[currency] || 0) + Number(commission.amount || 0);
        return totals;
      }, {});
    const settings = commissionSettings || {
      enabled: false,
      commission_rate: 0,
      qualifying_activity: "first_confirmed_deposit",
      approval_required: true,
    };
    return Response.json({
      data: {
        code: referral.code,
        total: referrals.length,
        active: referrals.filter(referralRecord => referralRecord.status === "active").length,
        referrals,
        commissionsEnabled: settings.enabled,
        commissionRate: Number(settings.commission_rate),
        qualifyingActivity: settings.qualifying_activity,
        approvalRequired: settings.approval_required,
        earnings: commissionTotals("approved"),
        pendingCommissions: commissionTotals("pending"),
        commissions: commissionRows || [],
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to load referral data:", error.message);
    return Response.json({ error: "Unable to load referral data right now." }, { status: 500 });
  }
}

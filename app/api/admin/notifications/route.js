import { getSupabaseClient, requireAdmin } from "../helpers";

export async function GET(request) {
  try {
    const authorization = await requireAdmin(request);
    if (authorization.error) return authorization.error;

    const supabase = getSupabaseClient({ useServiceRole: true });
    if (!supabase) {
      return Response.json({ error: "Admin notifications are not configured." }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("audit_logs")
      .select("id, action, section, record_id, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Unable to load admin notifications:", error.message);
      return Response.json({ error: "Unable to load admin notifications." }, { status: 503 });
    }

    return Response.json({ data: data || [] });
  } catch (error) {
    console.error("Admin notification request failed:", error.message);
    return Response.json({ error: "Unable to load admin notifications." }, { status: 500 });
  }
}

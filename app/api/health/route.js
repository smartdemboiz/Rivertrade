import { getSupabaseClient } from "@/app/api/admin/helpers";

export async function GET() {
  const startedAt = Date.now();
  const supabase = getSupabaseClient({ useServiceRole: false });
  let database = "not_configured";

  if (supabase) {
    const probe = supabase.from("profiles").select("id").limit(1);
    const timeout = new Promise((resolve) => setTimeout(() => resolve({ error: new Error("Database probe timeout") }), 2000));
    const { error } = await Promise.race([probe, timeout]);
    database = error ? "degraded" : "ok";
  }

  const healthy = database === "ok" || (database === "not_configured" && process.env.NODE_ENV !== "production");
  return Response.json(
    {
      ok: healthy,
      service: "rivertrade-web",
      database,
      environment: process.env.NODE_ENV || "development",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
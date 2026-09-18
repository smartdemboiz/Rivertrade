import { getAdminStats, requireAdmin } from "../helpers";

export async function GET(request) {
  try {
    const authorization = await requireAdmin(request);
    if (authorization.error) return authorization.error;
    const stats = await getAdminStats();
    return Response.json(stats);
  } catch (error) {
    return Response.json({ error: error.message || "Unable to load stats" }, { status: 500 });
  }
}

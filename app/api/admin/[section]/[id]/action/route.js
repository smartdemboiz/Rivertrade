import { executeOperationalAction, requireAdmin } from "../../../helpers";

export async function POST(request, { params }) {
  try {
    const authorization = await requireAdmin(request);
    if (authorization.error) return authorization.error;
    const { section, id } = await params;
    const body = await request.json();
    if (!body?.action) return Response.json({ error: "Action is required" }, { status: 400 });
    const data = await executeOperationalAction({ section, id, action: body.action, userId: authorization.user.id });
    return Response.json({ data });
  } catch (error) {
    const clientError = error.message?.includes("not available") || error.message?.includes("terminal") || error.message?.includes("required");
    return Response.json({ error: error.message || "Unable to apply action" }, { status: clientError ? 400 : 500 });
  }
}
import { executeOperationalAction, requireAdmin } from "../../../helpers";

export async function POST(request, { params }) {
  try {
    const authorization = await requireAdmin(request);
    if (authorization.error) return authorization.error;
    const { section, id } = await params;
    const body = await request.json();
    if (!body?.action) return Response.json({ error: "Action is required" }, { status: 400 });
    const data = await executeOperationalAction({
      section,
      id,
      action: body.action,
      userId: authorization.user.id,
    });
    return Response.json({ data });
  } catch (error) {
    const clientError = error.message?.includes("not available")
      || error.message?.includes("terminal")
      || error.message?.includes("required")
      || error.message?.includes("already has a different")
      || error.message?.includes("already credited in a different")
      || error.message?.includes("missing a valid customer")
      || error.message?.includes("rejected deposit")
      || error.message?.includes("rejected withdrawal")
      || error.message?.includes("Withdrawal payout")
      || error.message?.includes("Withdrawal amount")
      || error.message?.includes("approved withdrawal cannot be rejected")
      || error.message?.includes("Only pending investments")
      || error.message?.includes("Investment cannot be moved")
      || error.message?.includes("Investment review action")
      || error.message?.includes("Profit record")
      || error.message?.includes("profit can only be credited");
    return Response.json({ error: error.message || "Unable to apply action" }, { status: clientError ? 400 : 500 });
  }
}
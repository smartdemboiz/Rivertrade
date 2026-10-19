import { createAdminProfitCredit, requireAdmin } from "../helpers";

export async function POST(request) {
  const authorization = await requireAdmin(request);
  if (authorization.error) return authorization.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "A valid profit credit is required." }, { status: 400 });
  }

  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  const requestId = typeof body?.requestId === "string" ? body.requestId.trim() : "";
  const amountText = String(body?.amount ?? "").trim();
  const period = typeof body?.period === "string" ? body.period.trim() : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)
    || !/^\d+(?:\.\d{1,8})?$/.test(amountText)
    || !Number.isFinite(Number(amountText))
    || Number(amountText) <= 0
    || amountText.length > 32
    || !period
    || period.length > 80) {
    return Response.json({ error: "Select a customer and enter a positive amount and valid period." }, { status: 400 });
  }

  try {
    const data = await createAdminProfitCredit({
      userId,
      amount: amountText,
      period,
      requestId,
      adminId: authorization.user.id,
    });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    const status = error.code === "P0002" ? 404 : error.code === "22023" ? 400 : 500;
    console.error("Unable to credit investment profit:", error.message);
    return Response.json({ error: error.message || "Unable to credit investment profit." }, { status });
  }
}

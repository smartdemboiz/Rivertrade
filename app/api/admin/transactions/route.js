import { getAdminTransactions, requireAdmin } from "../helpers";

export async function GET(request) {
  try {
    const authorization = await requireAdmin(request);
    if (authorization.error) return authorization.error;
    const transactions = await getAdminTransactions();
    return Response.json({ data: transactions });
  } catch (error) {
    return Response.json({ error: error.message || "Unable to load transactions" }, { status: 500 });
  }
}

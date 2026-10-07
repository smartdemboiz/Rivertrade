import { fetchSupabaseRecords } from "../admin/helpers";

export async function GET() {
  const records = await fetchSupabaseRecords("paymentSettings");
  const enabled = (records || [])
    .filter((record) => record.enabled !== false && record.enabled !== "false")
    .filter((record) => record.destination === "withdrawal" || record.destination === "both");

  return Response.json({ data: enabled }, { headers: { "Cache-Control": "no-store" } });
}

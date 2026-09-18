import { fallbackData, fetchSupabaseRecords } from "../admin/helpers";

export async function GET() {
  const records = await fetchSupabaseRecords("paymentSettings");
  const enabled = (records || []).filter(record => record.enabled !== false && record.enabled !== "false");
  return Response.json({ data: enabled }, { headers: { "Cache-Control": "no-store" } });
}
import { fallbackData, fetchSupabaseRecords, insertSupabaseRecord, logAdminEvent, requireAdmin, validateAdminPayload } from "../helpers";

export async function GET(request, { params }) {
  try {
    const authorization = await requireAdmin(request);
    if (authorization.error) return authorization.error;
    const { section } = await params;
    const records = await fetchSupabaseRecords(section);
    return Response.json({ data: records || fallbackData[section] || [] });
  } catch (error) {
    return Response.json({ error: error.message || "Unable to load records" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const authorization = await requireAdmin(request);
    if (authorization.error) return authorization.error;
    const { section } = await params;
    if (section === "customers") {
      return Response.json({ error: "Customer accounts must be created through signup or an Auth invite." }, { status: 400 });
    }
    const body = validateAdminPayload(section, await request.json());
    const record = await insertSupabaseRecord(section, body);
    await logAdminEvent({ userId: authorization.user.id, action: "create", section, recordId: record?.id, metadata: body });
    return Response.json({ data: record }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message || "Unable to create record" }, { status: 500 });
  }
}

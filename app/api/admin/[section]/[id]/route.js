import { deleteSupabaseRecord, fallbackData, fetchSupabaseRecords, logAdminEvent, requireAdmin, updateSupabaseRecord, validateAdminPayload } from "../../helpers";

export async function PATCH(request, { params }) {
  try {
    const authorization = await requireAdmin(request);
    if (authorization.error) return authorization.error;
    const { section, id } = await params;
    const body = validateAdminPayload(section, await request.json());
    const updated = await updateSupabaseRecord(section, id, body);
    await logAdminEvent({ userId: authorization.user.id, action: "update", section, recordId: id, metadata: body });
    return Response.json({ data: updated });
  } catch (error) {
    return Response.json({ error: error.message || "Unable to update record" }, { status: error.message?.startsWith("Invalid") || error.message?.includes("required") ? 400 : 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authorization = await requireAdmin(request);
    if (authorization.error) return authorization.error;
    const { section, id } = await params;
    const deleted = await deleteSupabaseRecord(section, id);
    if (!deleted) throw new Error("Unable to delete record");
    await logAdminEvent({ userId: authorization.user.id, action: "delete", section, recordId: id });
    const list = await fetchSupabaseRecords(section);
    return Response.json({ data: list || fallbackData[section] || [] });
  } catch (error) {
    return Response.json({ error: error.message || "Unable to delete record" }, { status: 500 });
  }
}

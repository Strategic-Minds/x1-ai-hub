// Append-only audit logging shared across all backend functions.
// Every meaningful mutation emits an immutable receipt with an optional rollback reference.
export async function logAudit(svc, evt) {
  const e = {
    event_type: evt.event_type || "system",
    actor: evt.actor || "system",
    action: evt.action || "",
    target_type: evt.target_type || "",
    target_id: evt.target_id || "",
    details: evt.details ? (typeof evt.details === "string" ? evt.details : JSON.stringify(evt.details)) : "",
    severity: evt.severity || "info",
    receipt_id: evt.receipt_id || crypto.randomUUID(),
    rollback_ref: evt.rollback_ref || ""
  };
  return svc.entities.AuditEvent.create(e);
}
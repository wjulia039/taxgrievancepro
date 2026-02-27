import { SupabaseClient } from "@supabase/supabase-js";
import { AuditEventType, AuditEntityType } from "~/lib/shared/enums";

interface AuditEventParams {
  user_id: string;
  event_type: AuditEventType;
  entity_type: AuditEntityType;
  entity_id: string;
  ip?: string;
  user_agent?: string;
}

export async function logAuditEvent(
  supabase: SupabaseClient,
  params: AuditEventParams
): Promise<void> {
  const { error } = await supabase.from("audit_events").insert({
    user_id: params.user_id,
    event_type: params.event_type,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    ip: params.ip ?? null,
    user_agent: params.user_agent ?? null,
  });
  if (error) {
    console.error("[audit] Failed to log event:", params.event_type, error.message);
  }
}

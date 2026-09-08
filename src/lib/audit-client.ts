import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditAction } from "@/lib/audit-shared";
import type { AuditChange, AuditEntityType, Database } from "@/types/database.types";

/**
 * Client-safe counterpart to `recordAudit` (src/lib/audit.ts). A handful of
 * admin mutations happen directly from client components against Supabase
 * (no API route in between), so this calls the same `record_audit_event` RPC
 * straight from the browser client. The acting user is still stamped
 * server-side from the request's JWT — this file only avoids importing
 * `next/headers`, which would break the client bundle.
 *
 * IP address cannot be captured this way (no server hop); the user agent is
 * read from `navigator` instead.
 */
export async function recordAuditClient(
  supabase: SupabaseClient<Database>,
  params: {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string | null;
    summary: string;
    changes?: AuditChange[];
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const { error } = await supabase.rpc("record_audit_event", {
      p_action: params.action,
      p_entity_type: params.entityType,
      p_entity_id: params.entityId ?? null,
      p_summary: params.summary,
      p_changes: params.changes ?? [],
      p_metadata: params.metadata ?? {},
      p_ip_address: null,
      p_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });

    if (error) {
      console.error(`Failed to record audit event "${params.action}":`, error);
    }
  } catch (error) {
    console.error(`Failed to record audit event "${params.action}":`, error);
  }
}

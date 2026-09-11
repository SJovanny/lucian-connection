import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditChange, AuditEntityType, Database } from "@/types/database.types";
import { type AuditAction } from "@/lib/audit-shared";

// Re-exported for convenience so most server-side call sites only need to
// import from "@/lib/audit". Client components must import these from
// "@/lib/audit-shared" instead (see that file for why).
export { AUDIT_ACTIONS, diffFields, type AuditAction } from "@/lib/audit-shared";

type RecordAuditParams = {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  summary: string;
  changes?: AuditChange[];
  metadata?: Record<string, unknown>;
};

async function getRequestContext(): Promise<{ ip: string | null; userAgent: string | null }> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0]?.trim() || null : headersList.get("x-real-ip");
    return { ip, userAgent: headersList.get("user-agent") };
  } catch {
    // Not running inside a request context (shouldn't happen for API
    // routes/server actions, but never let audit logging break the caller).
    return { ip: null, userAgent: null };
  }
}

/**
 * Record an entry in the staff activity log. Always best-effort: a failure
 * to log is reported to the console but never thrown, so it can never break
 * the admin action it is attached to.
 *
 * The acting user is stamped server-side (from the JWT bound to `supabase`)
 * by the `record_audit_event` SQL function, so it cannot be spoofed by the
 * caller — `supabase` must be a client authenticated as the staff member
 * performing the action (e.g. the client returned by `getStaffSupabase`).
 *
 * Works from both Route Handlers and Server Actions (both can call
 * `next/headers`). For direct client-side mutations, use
 * `recordAuditClient` from "@/lib/audit-client" instead.
 */
export async function recordAudit(
  supabase: SupabaseClient<Database>,
  { action, entityType, entityId, summary, changes, metadata }: RecordAuditParams
): Promise<void> {
  try {
    const { ip, userAgent } = await getRequestContext();

    const { error } = await supabase.rpc("record_audit_event", {
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId ?? null,
      p_summary: summary,
      p_changes: changes ?? [],
      p_metadata: metadata ?? {},
      p_ip_address: ip,
      p_user_agent: userAgent,
    });

    if (error) {
      console.error(`Failed to record audit event "${action}":`, error);
    }
  } catch (error) {
    console.error(`Failed to record audit event "${action}":`, error);
  }
}

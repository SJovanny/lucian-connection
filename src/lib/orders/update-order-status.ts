import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { recordAudit } from "@/lib/audit";
import { getOrderTransitionError, orderStatusUpdateSchema } from "./order-transitions";

export class OrderStatusUpdateError extends Error {
  constructor(message: string, public readonly status: 400 | 404 | 409) {
    super(message);
    this.name = "OrderStatusUpdateError";
  }
}

/** The caller must pass the same staff-authenticated client used to authorize. */
export async function updateOrderStatus(
  supabase: SupabaseClient<Database>,
  orderId: unknown,
  status: unknown,
) {
  const parsed = orderStatusUpdateSchema.safeParse({ orderId, status });
  if (!parsed.success) throw new OrderStatusUpdateError("Invalid order ID or status", 400);
  const input = parsed.data;
  const { data: previous, error: readError } = await supabase
    .from("orders")
    .select("status, payment_status, contains_alcohol, pickup_age_verified_at")
    .eq("id", input.orderId)
    .maybeSingle();
  if (readError) throw readError;
  if (!previous) throw new OrderStatusUpdateError("Order not found", 404);

  const policyError = getOrderTransitionError(previous, input.status);
  if (policyError) throw new OrderStatusUpdateError(policyError, 409);

  let update = supabase.from("orders")
    .update({ status: input.status })
    .eq("id", input.orderId)
    .eq("status", previous.status)
    .eq("payment_status", previous.payment_status);
  // Completion also depends on the alcohol/verification snapshot.
  if (input.status === "completed") {
    update = update.eq("contains_alcohol", previous.contains_alcohol);
    update = previous.pickup_age_verified_at === null
      ? update.is("pickup_age_verified_at", null)
      : update.eq("pickup_age_verified_at", previous.pickup_age_verified_at);
  }
  const { data, error } = await update.select().maybeSingle();
  if (error) throw error;
  if (!data) throw new OrderStatusUpdateError("Order changed concurrently; refresh and retry", 409);

  // Best-effort and non-durable: this separate audit call is not atomic with
  // the update. recordAudit logs failures without failing the successful change.
  await recordAudit(supabase, {
    action: "order.status_changed",
    entityType: "order",
    entityId: input.orderId,
    summary: `Statut de commande modifié : ${previous.status} → ${input.status}`,
    changes: [{ field: "status", old: previous.status, new: input.status }],
  });
  return data;
}

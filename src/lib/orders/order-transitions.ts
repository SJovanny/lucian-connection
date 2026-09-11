import { z } from "zod";
import { uuidSchema } from "@/lib/api-schemas";
import type { Order, OrderStatus } from "@/types/database.types";

export const orderStatusUpdateSchema = z.object({
  orderId: uuidSchema,
  status: z.enum(["pending", "preparing", "ready", "completed", "cancelled"]),
});

// Forward shortcuts are supported by the admin status picker. Refunds have
// their own workflow; terminal orders cannot be changed through this policy.
const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["preparing", "ready", "completed", "cancelled"],
  preparing: ["ready", "completed", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  refunded: [],
};

export function canTransitionOrderStatus(current: OrderStatus, target: OrderStatus): boolean {
  return transitions[current]?.includes(target) ?? false;
}

export type OrderTransitionSnapshot = Pick<Order,
  "status" | "payment_status" | "contains_alcohol" | "pickup_age_verified_at"
>;

export function getOrderTransitionError(order: OrderTransitionSnapshot, target: OrderStatus): string | null {
  if (!canTransitionOrderStatus(order.status, target)) return "Invalid order status transition";
  if (["preparing", "ready", "completed"].includes(target)) {
    if (!["paid", "partially_refunded"].includes(order.payment_status)) {
      return "Order must be paid before entering preparation";
    }
    if (target === "completed" && order.contains_alcohol && !order.pickup_age_verified_at) {
      return "PICKUP_AGE_REQUIRED";
    }
  }
  return null;
}

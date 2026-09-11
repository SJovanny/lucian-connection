import { describe, expect, it } from "vitest";
import { canTransitionOrderStatus, getOrderTransitionError, type OrderTransitionSnapshot } from "@/lib/orders/order-transitions";
import type { OrderStatus } from "@/types/database.types";

const statuses: OrderStatus[] = ["pending", "preparing", "ready", "completed", "cancelled", "refunded"];
const allowed = new Set([
  "pending:preparing", "pending:ready", "pending:completed", "pending:cancelled",
  "preparing:ready", "preparing:completed", "preparing:cancelled", "ready:completed", "ready:cancelled",
]);
const snapshot: OrderTransitionSnapshot = {
  status: "pending", payment_status: "paid", contains_alcohol: false, pickup_age_verified_at: null,
};

describe("order transition policy", () => {
  it.each(statuses.flatMap((from) => statuses.map((to) => [from, to] as const)))("checks %s → %s", (from, to) => {
    expect(canTransitionOrderStatus(from, to)).toBe(allowed.has(`${from}:${to}`));
  });

  it.each<OrderTransitionSnapshot["payment_status"]>([
    "paid", "partially_refunded", "pending_payment", "payment_failed", "cancelled", "refunded",
  ])("requires eligible payment for fulfillment: %s", (payment_status) => {
    for (const target of ["preparing", "ready", "completed"] as const) {
      expect(getOrderTransitionError({ ...snapshot, payment_status }, target) === null)
        .toBe(["paid", "partially_refunded"].includes(payment_status));
    }
    expect(getOrderTransitionError({ ...snapshot, payment_status }, "cancelled")).toBeNull();
  });

  it("requires alcohol verification only for completion", () => {
    const alcoholic = { ...snapshot, contains_alcohol: true };
    expect(getOrderTransitionError(alcoholic, "preparing")).toBeNull();
    expect(getOrderTransitionError(alcoholic, "ready")).toBeNull();
    expect(getOrderTransitionError(alcoholic, "completed")).toBe("PICKUP_AGE_REQUIRED");
    expect(getOrderTransitionError({ ...alcoholic, pickup_age_verified_at: "2026-09-11T12:00:00Z" }, "completed")).toBeNull();
  });
});

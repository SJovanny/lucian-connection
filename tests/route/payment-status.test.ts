import { NextRequest } from "next/server";
import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), retrieve: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("stripe", async (importOriginal) => {
  const { default: ActualStripe } = await importOriginal<typeof import("stripe")>();
  return { default: class {
    static errors = ActualStripe.errors;
    checkout = { sessions: { retrieve: mocks.retrieve } };
  } };
});
import { GET } from "@/app/api/payments/status/route";

const sessionId = "cs_test_123abc";
const orderId = "11111111-1111-4111-8111-111111111111";
const order = { id: orderId, user_id: "user-1", payment_status: "paid", payment_reference: "pi_123" };
const session = { id: sessionId, mode: "payment", metadata: { user_id: "user-1", order_id: orderId }, payment_intent: "pi_123", payment_status: "paid" };
const request = (query = `session_id=${sessionId}`) => new NextRequest(`https://shop.example/api/payments/status?${query}`);

describe("payment status", () => {
  const maybeSingle = vi.fn();
  const eq = vi.fn();
  const from = vi.fn();
  const getUser = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");
    const builder = { select: vi.fn().mockReturnThis(), eq, maybeSingle };
    eq.mockReturnValue(builder);
    from.mockReturnValue(builder);
    maybeSingle.mockResolvedValue({ data: order, error: null });
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mocks.createClient.mockResolvedValue({ auth: { getUser }, from });
    mocks.retrieve.mockResolvedValue(session);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("requires authentication before reading Stripe or orders", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await GET(request())).status).toBe(401);
    expect(from).not.toHaveBeenCalled();
    expect(mocks.retrieve).not.toHaveBeenCalled();
  });

  it.each(["", "session_id=", "session_id=pi_123", "session_id=cs_test_a%2Fb", `session_id=cs_${"a".repeat(256)}`, `session_id=${sessionId}&session_id=${sessionId}`])("rejects malformed query %s before external reads", async (query) => {
    expect((await GET(request(query))).status).toBe(400);
    expect(from).not.toHaveBeenCalled();
    expect(mocks.retrieve).not.toHaveBeenCalled();
  });

  it.each(["pending_payment", "paid", "partially_refunded", "refunded", "payment_failed", "cancelled"])("returns local %s even when Stripe says paid", async (payment_status) => {
    maybeSingle.mockResolvedValue({ data: { ...order, payment_status }, error: null });
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.json()).toEqual({ order_id: orderId, payment_status });
    expect(mocks.retrieve).toHaveBeenCalledWith(sessionId);
    expect(from).toHaveBeenCalledWith("orders");
    expect(eq.mock.calls).toEqual([["id", orderId], ["user_id", "user-1"]]);
    // The mock exposes read methods only: any attempted mutation fails this test.
  });

  it.each([
    { ...session, metadata: { user_id: "other", order_id: orderId } },
    { ...session, metadata: {} },
    { ...session, metadata: { user_id: "user-1", order_id: "bad-id" } },
    { ...session, id: "cs_test_other" },
    { ...session, mode: "subscription" },
  ])("rejects untrusted session metadata before reading orders", async (value) => {
    mocks.retrieve.mockResolvedValue(value);
    expect((await GET(request())).status).toBe(404);
    expect(from).not.toHaveBeenCalled();
  });

  it.each([null, { ...order, user_id: "other" }, { ...order, id: "other" }, { ...order, payment_reference: "pi_other" }])("rejects missing or mismatched orders", async (data) => {
    maybeSingle.mockResolvedValue({ data, error: null });
    expect((await GET(request())).status).toBe(404);
  });

  it.each([sessionId, null])("supports the pre-webhook reference %s without confirming pending payment", async (payment_reference) => {
    maybeSingle.mockResolvedValue({ data: { ...order, payment_reference, payment_status: "pending_payment" }, error: null });
    expect(await (await GET(request())).json()).toEqual({ order_id: orderId, payment_status: "pending_payment" });
  });

  it("fails closed on database errors", async () => {
    maybeSingle.mockResolvedValue({ data: order, error: { message: "private detail" } });
    const response = await GET(request());
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("private detail");
  });

  it("handles Stripe outages and missing sessions without exposing provider errors", async () => {
    mocks.retrieve.mockRejectedValue(new Error("private detail"));
    const response = await GET(request());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("private detail");
    mocks.retrieve.mockRejectedValue(new Stripe.errors.StripeInvalidRequestError({ message: "missing", code: "resource_missing" }));
    expect((await GET(request())).status).toBe(404);
    expect(from).not.toHaveBeenCalled();
  });
});

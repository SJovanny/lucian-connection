import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ authorize: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/admin-auth", () => ({ getStaffSupabase: mocks.authorize }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
import { PATCH } from "@/app/api/admin/orders/[id]/route";
import { updateOrderStatus as action } from "@/lib/admin-actions";

const id = "11111111-1111-4111-8111-111111111111";
const previous = { status: "pending", payment_status: "paid", contains_alcohol: false, pickup_age_verified_at: null };

describe("order status route and shared service", () => {
  const read = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn() };
  const write = { update: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), is: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), maybeSingle: vi.fn() };
  const client = { from: vi.fn(), rpc: vi.fn() };
  const call = (body: unknown = { status: "preparing" }, orderId = id, raw = false) => PATCH(
    new NextRequest(`https://shop.example/api/admin/orders/${orderId}`, { method: "PATCH", body: raw ? String(body) : JSON.stringify(body) }),
    { params: Promise.resolve({ id: orderId }) },
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorize.mockResolvedValue(client);
    client.from.mockReset().mockReturnValueOnce(read).mockReturnValue(write);
    read.maybeSingle.mockReset().mockResolvedValue({ data: previous, error: null });
    write.maybeSingle.mockReset().mockResolvedValue({ data: { ...previous, id, status: "preparing" }, error: null });
    client.rpc.mockReset().mockResolvedValue({ error: null });
  });

  it("requires staff before any order access", async () => {
    mocks.authorize.mockResolvedValue(null);
    expect((await call()).status).toBe(401);
    await expect(action(id, "preparing")).rejects.toThrow("Unauthorized");
    expect(client.from).not.toHaveBeenCalled();
  });

  it.each([null, [], {}, { status: "refunded" }, { status: "bogus" }, { status: 1 }])("rejects invalid input %j", async (body) => {
    expect((await call(body)).status).toBe(400);
    expect(client.from).not.toHaveBeenCalled();
  });

  it("rejects invalid UUIDs and malformed JSON before database access", async () => {
    expect((await call({ status: "ready" }, "bad-id")).status).toBe(400);
    expect((await call("{", id, true)).status).toBe(400);
    await expect(action("bad-id", "ready")).rejects.toMatchObject({ status: 400 });
    await expect(action(id, "refunded")).rejects.toMatchObject({ status: 400 });
    expect(client.from).not.toHaveBeenCalled();
  });

  it("returns 404 for a missing order", async () => {
    read.maybeSingle.mockResolvedValue({ data: null, error: null });
    expect((await call()).status).toBe(404);
    expect(write.update).not.toHaveBeenCalled();
  });

  it.each(["read", "write"])("fails closed on %s database errors", async (stage) => {
    const result = { data: null, error: { message: "private database detail" } };
    (stage === "read" ? read : write).maybeSingle.mockResolvedValue(result);
    const response = await call();
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("private database detail");
    expect(client.rpc).not.toHaveBeenCalled();
    if (stage === "read") expect(write.update).not.toHaveBeenCalled();
  });

  it.each([
    { ...previous, status: "completed" },
    { ...previous, status: "ready" },
    { ...previous, payment_status: "pending_payment" },
  ])("rejects policy conflicts before writing: %j", async (data) => {
    read.maybeSingle.mockResolvedValue({ data, error: null });
    expect((await call()).status).toBe(409);
    expect(write.update).not.toHaveBeenCalled();
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it.each(["status", "payment_status"])("returns 409 when concurrent %s changes invalidate the snapshot", async (field) => {
    const concurrent = { ...previous, [field]: field === "status" ? "cancelled" : "refunded" };
    write.maybeSingle.mockImplementation(async () => {
      const matches = write.eq.mock.calls.every(([key, value]) => key === "id" || concurrent[key as keyof typeof concurrent] === value);
      return { data: matches ? { ...concurrent, id, status: "preparing" } : null, error: null };
    });
    expect((await call()).status).toBe(409);
    expect(write.eq.mock.calls).toEqual([["id", id], ["status", "pending"], ["payment_status", "paid"]]);
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("checks and conditionally guards alcohol verification at completion", async () => {
    read.maybeSingle.mockResolvedValue({ data: { ...previous, contains_alcohol: true }, error: null });
    expect((await call({ status: "completed" })).status).toBe(409);
    client.from.mockReset().mockReturnValueOnce(read).mockReturnValue(write);
    const verified = "2026-09-11T12:00:00Z";
    read.maybeSingle.mockResolvedValue({ data: { ...previous, contains_alcohol: true, pickup_age_verified_at: verified }, error: null });
    write.maybeSingle.mockResolvedValue({ data: null, error: null });
    expect((await call({ status: "completed" })).status).toBe(409);
    expect(write.eq).toHaveBeenCalledWith("contains_alcohol", true);
    expect(write.eq).toHaveBeenCalledWith("pickup_age_verified_at", verified);
  });

  it("returns the order and audits the actual transition on the authorized client", async () => {
    const response = await call();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ order: { ...previous, id, status: "preparing" } });
    expect(write.update).toHaveBeenCalledWith({ status: "preparing" });
    expect(client.rpc).toHaveBeenCalledWith("record_audit_event", expect.objectContaining({
      p_entity_id: id, p_changes: [{ field: "status", old: "pending", new: "preparing" }],
    }));
  });

  it("uses the authorized client from the server action and preserves its return shape", async () => {
    expect(await action(id, "preparing")).toEqual({ id, status: "preparing" });
    expect(mocks.authorize).toHaveBeenCalledWith();
    expect(write.eq).toHaveBeenCalledWith("payment_status", "paid");
    expect(client.rpc).toHaveBeenCalledOnce();
  });

  it.each([false, true])("keeps successful changes successful on best-effort audit failure (throws=%s)", async (throws) => {
    if (throws) client.rpc.mockRejectedValue(new Error("audit unavailable"));
    else client.rpc.mockResolvedValue({ error: { message: "audit unavailable" } });
    expect((await call()).status).toBe(200);
  });
});

import { describe, expect, it } from "vitest";
import { getPricingQuote, PricingError, toCents } from "@/lib/pricing";

const productId = "018f2d3e-1234-7abc-8def-1234567890ab";
const secondProductId = "018f2d3e-1234-7abc-8def-1234567890ac";
const items = [{ id: productId, quantity: 1 }];
const product = {
  id: productId,
  price: "12.50",
  discounted_price: null,
  translations: { en: { name: "Test product" } },
};
const validSettings = { preparation_fee: "1.50", min_order_amount: "10.00" };

function mockSupabase(
  settings: unknown = validSettings,
  products: unknown[] = [product],
  settingsError: unknown = null
): Parameters<typeof getPricingQuote>[0] {
  return {
    from(table: string) {
      if (table === "products_with_discount") {
        return {
          select: () => ({
            in: () => ({
              eq: async () => ({ data: products, error: null }),
            }),
          }),
        };
      }
      if (table === "store_settings") {
        return {
          select: () => ({
            limit: () => ({
              maybeSingle: async () => ({ data: settings, error: settingsError }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
  } as unknown as Parameters<typeof getPricingQuote>[0];
}

const invalidAmounts = [
  null, undefined, true, false, "", " \t\n", "invalid", {}, [],
  -1, Number.NaN, Infinity, -Infinity, "Infinity", "NaN",
  Number.MAX_VALUE, Number.MAX_SAFE_INTEGER / 100 + 1,
];

describe("toCents validation", () => {
  it.each(invalidAmounts)("rejects invalid monetary input %s", (value) => {
    expect(() => toCents(value)).toThrow(PricingError);
    expect(() => toCents(value)).toThrow(expect.objectContaining({ code: "INVALID_PRICE" }));
  });

  it.each([0, "0", "0.00"])("preserves zero %s", (value) => {
    expect(toCents(value)).toBe(0);
  });

  it("accepts database numeric strings and rounds to cents", () => {
    expect(toCents("12.345")).toBe(1235);
    expect(toCents(" 12.50 ")).toBe(1250);
  });
});

describe("getPricingQuote settings", () => {
  it("fails closed when the settings row is missing", async () => {
    await expect(getPricingQuote(mockSupabase(null), items)).rejects.toMatchObject({
      name: "PricingError", code: "SETTINGS_UNAVAILABLE",
    });
  });

  it("rejects a settings query error", async () => {
    await expect(getPricingQuote(mockSupabase(validSettings, [product], { message: "failed" }), items))
      .rejects.toMatchObject({ code: "SETTINGS_UNAVAILABLE" });
  });

  it.each([0, "0.00"])("preserves legitimate zero fee and minimum %s", async (zero) => {
    const quote = await getPricingQuote(mockSupabase({
      preparation_fee: zero, min_order_amount: zero,
    }, [{ ...product, price: zero }]), items);
    expect(quote).toMatchObject({
      subtotal_cents: 0, preparation_fee_cents: 0, discount_cents: 0, total_cents: 0,
    });
  });

  it("quotes database numeric strings", async () => {
    const quote = await getPricingQuote(mockSupabase(), items);
    expect(quote).toMatchObject({
      subtotal_cents: 1250, preparation_fee_cents: 150, total_cents: 1400,
    });
  });

  describe.each(["preparation_fee", "min_order_amount"])("validates %s", (field) => {
    it.each(invalidAmounts)("fails closed for %s", async (value) => {
      await expect(getPricingQuote(mockSupabase({ ...validSettings, [field]: value }), items))
        .rejects.toMatchObject({ name: "PricingError", code: "SETTINGS_UNAVAILABLE" });
    });
  });

  it("enforces a valid nonzero minimum", async () => {
    await expect(getPricingQuote(mockSupabase({ ...validSettings, min_order_amount: "20.00" }), items))
      .rejects.toMatchObject({ code: "MIN_ORDER_NOT_MET" });
  });
});

describe("getPricingQuote monetary overflow", () => {
  const largePrice = 50_000_000_000_000;

  it("rejects unsafe product cents", async () => {
    await expect(getPricingQuote(mockSupabase(validSettings, [{ ...product, price: Number.MAX_VALUE }]), items))
      .rejects.toMatchObject({ code: "INVALID_PRICE" });
  });

  it("rejects line total overflow", async () => {
    await expect(getPricingQuote(mockSupabase(validSettings, [{ ...product, price: largePrice }]), [
      { id: productId, quantity: 2 },
    ])).rejects.toMatchObject({ code: "INVALID_PRICE" });
  });

  it("rejects subtotal overflow", async () => {
    await expect(getPricingQuote(mockSupabase(validSettings, [
      { ...product, price: largePrice },
      { ...product, id: secondProductId, price: largePrice },
    ]), [...items, { id: secondProductId, quantity: 1 }]))
      .rejects.toMatchObject({ code: "INVALID_PRICE" });
  });

  it("rejects total overflow from an otherwise valid fee", async () => {
    await expect(getPricingQuote(mockSupabase({
      preparation_fee: largePrice, min_order_amount: 0,
    }, [{ ...product, price: largePrice }]), items))
      .rejects.toMatchObject({ code: "INVALID_PRICE" });
  });
});

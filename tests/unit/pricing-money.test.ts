import { describe, expect, it } from "vitest";
import {
  fromCents,
  parsePricingItems,
  PricingError,
  toCents,
} from "@/lib/pricing";

describe("pricing money conversion", () => {
  it("rounds database monetary values to integer cents", () => {
    expect(toCents("12.345")).toBe(1235);
    expect(fromCents(1235)).toBe(12.35);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, "invalid"])(
    "rejects invalid monetary value %s",
    (value) => {
      expect(() => toCents(value)).toThrow(PricingError);
    }
  );
});

describe("parsePricingItems", () => {
  const id = "018f2d3e-1234-7abc-8def-1234567890ab";

  it("accepts bounded UUID cart entries", () => {
    expect(parsePricingItems([{ id, quantity: 2 }])).toEqual([{ id, quantity: 2 }]);
  });

  it.each(["2", true, 0, -1, 1.5, 101, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid quantity %s",
    (quantity) => {
      expect(() => parsePricingItems([{ id, quantity }])).toThrow(PricingError);
    }
  );

  it("rejects duplicate product IDs", () => {
    expect(() => parsePricingItems([{ id, quantity: 1 }, { id, quantity: 1 }])).toThrow(
      PricingError
    );
  });
});

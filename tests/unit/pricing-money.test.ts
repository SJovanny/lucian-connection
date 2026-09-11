import { describe, expect, it } from "vitest";
import { fromCents, PricingError, toCents } from "@/lib/pricing";

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

import { describe, expect, it } from "vitest";
import { CouponRuleError, normalizeCouponData } from "@/lib/coupon-rules";

const validCoupon = {
  code: " welcome10 ",
  discount_type: "percentage",
  discount_value: 10,
  min_order_amount: 0,
  starts_at: "2026-09-01T00:00:00.000Z",
};

describe("normalizeCouponData", () => {
  it("normalizes valid coupon input", () => {
    expect(normalizeCouponData(validCoupon)).toMatchObject({
      code: "WELCOME10",
      discount_type: "percentage",
      discount_value: 10,
      min_order_amount: 0,
    });
  });

  it.each([0, -1, 101, Number.NaN])("rejects invalid percentage %s", (discountValue) => {
    expect(() => normalizeCouponData({ ...validCoupon, discount_value: discountValue })).toThrow(
      CouponRuleError
    );
  });

  it("rejects an expiration before the start date", () => {
    expect(() =>
      normalizeCouponData({
        ...validCoupon,
        expires_at: "2026-08-31T23:59:59.000Z",
      })
    ).toThrow(CouponRuleError);
  });
});

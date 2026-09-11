"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/routing";
import type { CartItem } from "@/store/cartStore";

export function useCheckoutCoupon(items: CartItem[], locale: Locale) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; id: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError(null);
    setAppliedCoupon(null);
    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), items: items.map(({ id, quantity }) => ({ id, quantity })), locale }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCouponError(data.message || "Error validating coupon");
      } else if (res.ok && typeof data.coupon?.id === "string" && typeof data.coupon?.code === "string") {
        setAppliedCoupon({ id: data.coupon.id, code: data.coupon.code });
        setCouponCode("");
      } else {
        setCouponError("Error validating coupon");
      }
    } catch (error) {
      console.error(error);
      setCouponError("Error validating coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(""); };
  return { couponCode, setCouponCode, appliedCoupon, couponError, isValidatingCoupon, handleApplyCoupon, removeCoupon };
}

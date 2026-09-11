"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LoyaltyLedgerEntry, LoyaltyReward } from "@/types/database.types";

export type LoyaltyData = {
  balance: number;
  ledger: LoyaltyLedgerEntry[];
  rewards: LoyaltyReward[];
  redemptions: Array<{
    id: string;
    created_at: string;
    points_spent: number;
    coupons?: { code: string } | null;
  }>;
};

export function useLoyalty() {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const redeemingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch("/api/loyalty");
      if (!response.ok) throw new Error("Loyalty load failed");
      const result: LoyaltyData = await response.json();
      if (!result || !Number.isFinite(result.balance) || !Array.isArray(result.ledger)
        || !Array.isArray(result.rewards) || !Array.isArray(result.redemptions)) {
        throw new Error("Invalid loyalty response");
      }
      setData(result);
      setRedeemError(null);
    } catch {
      setLoadError(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const redeem = async (rewardId: string) => {
    if (redeemingRef.current || loadingRef.current || loadError) return;
    redeemingRef.current = true;
    setRedeeming(rewardId);
    setRedeemError(null);
    setCouponCode(null);
    try {
      const response = await fetch("/api/loyalty/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reward_id: rewardId }),
      });
      if (!response.ok) throw new Error("Loyalty redemption failed");
      const result = await response.json();
      if (typeof result?.coupon_code !== "string" || !result.coupon_code) {
        throw new Error("Invalid redemption response");
      }
      setCouponCode(result.coupon_code);
      await load();
    } catch {
      setRedeemError(rewardId);
    } finally {
      redeemingRef.current = false;
      setRedeeming(null);
    }
  };

  return { data, loading, loadError, redeeming, redeemError, couponCode, load, redeem };
}

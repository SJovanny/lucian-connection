"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/store/cartStore";

type AgeResult = { key: string } & ({ status: "ready"; containsAlcohol: boolean } | { status: "error" });

export function useCheckoutAgeRequirement(items: CartItem[]) {
  const key = JSON.stringify(items.map(({ id }) => id).sort());
  const [result, setResult] = useState<AgeResult | null>(null);
  const [requiredKey, setRequiredKey] = useState<string | null>(null);
  useEffect(() => {
    let isCurrent = true;
    const productIds = JSON.parse(key) as string[];
    if (productIds.length) {
      fetch("/api/products/age-requirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_ids: productIds }),
      }).then(async (response) => {
        if (!response.ok) throw new Error("Age requirement unavailable");
        const data = await response.json();
        if (typeof data.containsAlcohol !== "boolean") throw new Error("Invalid age requirement");
        if (isCurrent) setResult({ key, status: "ready", containsAlcohol: data.containsAlcohol });
      }).catch(() => {
        if (isCurrent) setResult({ key, status: "error" });
      });
    }
    return () => { isCurrent = false; };
  }, [key]);

  const status = items.length === 0 ? "ready" : result?.key === key ? result.status : "pending";
  const containsAlcohol = requiredKey === key || items.some((item) => item.is_alcoholic)
    || (result?.key === key && result.status === "ready" && result.containsAlcohol);
  return { status, containsAlcohol, requireAgeConfirmation: () => setRequiredKey(key) };
}

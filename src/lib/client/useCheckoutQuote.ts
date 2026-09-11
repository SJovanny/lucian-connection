"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/routing";
import type { CartItem } from "@/store/cartStore";
import type { PricingQuote } from "@/lib/pricing-types";
import { fetchPricingQuote, getPricingErrorMessage, PricingQuoteRequestError } from "@/lib/client-pricing";

export function useCheckoutQuote(items: CartItem[], couponId: string | null, locale: Locale) {
  const [quoteState, setQuoteState] = useState<{ key: string; quote: PricingQuote } | null>(null);
  const [quoteError, setQuoteError] = useState<{ key: string; message: string } | null>(null);
  const quoteKey = [locale, couponId || "", ...items.map((item) => `${item.id}:${item.quantity}`).sort()].join("|");

  useEffect(() => {
    let isCurrent = true;
    if (items.length > 0) {
      fetchPricingQuote({ items: items.map(({ id, quantity }) => ({ id, quantity })), couponId, locale })
        .then((quote) => {
          if (!isCurrent) return;
          setQuoteState({ key: quoteKey, quote });
          setQuoteError(null);
        })
        .catch((error: unknown) => {
          if (!isCurrent) return;
          setQuoteError({ key: quoteKey, message: error instanceof PricingQuoteRequestError
            ? getPricingErrorMessage(error.code, error.message, locale)
            : error instanceof Error ? error.message : getPricingErrorMessage("QUOTE_UNAVAILABLE", undefined, locale) });
        });
    }
    return () => { isCurrent = false; };
  }, [items, couponId, locale, quoteKey]);

  return {
    quoteKey,
    setQuoteState,
    displayQuote: quoteState?.key === quoteKey ? quoteState.quote : null,
    currentQuoteError: quoteError?.key === quoteKey ? quoteError.message : null,
  };
}

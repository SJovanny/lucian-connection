import type { PricingQuote } from "@/lib/pricing-types";

type QuoteItem = {
  id: string;
  quantity: number;
};

export class PricingQuoteRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly quote?: PricingQuote
  ) {
    super(message);
    this.name = "PricingQuoteRequestError";
  }
}

export async function fetchPricingQuote(options: {
  items: QuoteItem[];
  locale?: string;
  couponId?: string | null;
  couponCode?: string | null;
}): Promise<PricingQuote> {
  const response = await fetch("/api/payments/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });
  const data = await response.json();

  if (!response.ok || !data.quote) {
    throw new PricingQuoteRequestError(
      data?.error || "QUOTE_UNAVAILABLE",
      data?.details || "Unable to calculate the order total",
      data?.quote
    );
  }

  return data.quote as PricingQuote;
}

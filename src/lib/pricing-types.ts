export const PRICING_CURRENCY = "eur" as const;

export type PricingQuoteItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
};

export type PricingQuote = {
  currency: typeof PRICING_CURRENCY;
  items: PricingQuoteItem[];
  subtotal_cents: number;
  preparation_fee_cents: number;
  discount_cents: number;
  total_cents: number;
  coupon: {
    id: string;
    code: string;
  } | null;
};

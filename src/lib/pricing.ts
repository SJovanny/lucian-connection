import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Coupon } from "@/types/database.types";
import {
  PRICING_CURRENCY,
  type PricingQuote,
  type PricingQuoteItem,
} from "@/lib/pricing-types";

type PricingClient = SupabaseClient<Database>;

type ProductRow = {
  id: string;
  price: number;
  discounted_price: number | null;
  translations: Record<string, { name?: string }>;
};

type CartItemInput = {
  id: string;
  quantity: number;
};

export type PricingErrorCode =
  | "INVALID_ITEMS"
  | "PRODUCT_UNAVAILABLE"
  | "INVALID_QUANTITY"
  | "INVALID_PRICE"
  | "SETTINGS_UNAVAILABLE"
  | "COUPON_UNAVAILABLE"
  | "COUPON_NOT_ALLOWED"
  | "COUPON_USAGE_LIMIT"
  | "COUPON_FIRST_ORDER_ONLY"
  | "COUPON_LOGIN_REQUIRED"
  | "COUPON_MINIMUM_NOT_MET"
  | "MIN_ORDER_NOT_MET";

export class PricingError extends Error {
  constructor(
    public readonly code: PricingErrorCode,
    message: string
  ) {
    super(message);
    this.name = "PricingError";
  }
}

export function toCents(value: unknown, code: PricingErrorCode = "INVALID_PRICE"): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new PricingError(code, "Invalid monetary amount");
  }
  return Math.round(amount * 100);
}

export function fromCents(value: number): number {
  return value / 100;
}

function parseItems(value: unknown): CartItemInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new PricingError("INVALID_ITEMS", "The cart is empty");
  }

  const seen = new Set<string>();
  return value.map((item) => {
    if (!item || typeof item !== "object") {
      throw new PricingError("INVALID_ITEMS", "Invalid cart item");
    }

    const rawItem = item as { id?: unknown; quantity?: unknown };
    const id = String(rawItem.id || "");
    const quantity = Number(rawItem.quantity);

    if (!id || seen.has(id)) {
      throw new PricingError("INVALID_ITEMS", "Invalid or duplicated cart item");
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new PricingError("INVALID_QUANTITY", "Invalid product quantity");
    }

    seen.add(id);
    return { id, quantity };
  });
}

async function getCoupon(
  supabase: PricingClient,
  couponId?: string | null,
  couponCode?: string | null
): Promise<Coupon | null> {
  const normalizedCouponId = typeof couponId === "string" ? couponId.trim() : "";
  const normalizedCouponCode = typeof couponCode === "string"
    ? couponCode.trim().toUpperCase()
    : "";

  if (!normalizedCouponId && !normalizedCouponCode) return null;

  const query = supabase.from("coupons_active").select("*");

  const { data, error } = normalizedCouponId
    ? await query.eq("id", normalizedCouponId).maybeSingle()
    : await query.eq("code", normalizedCouponCode).maybeSingle();

  if (error || !data) {
    throw new PricingError("COUPON_UNAVAILABLE", "Coupon unavailable");
  }

  return data as Coupon;
}

async function assertCouponAllowed(
  supabase: PricingClient,
  coupon: Coupon,
  userId: string | null | undefined,
  subtotalCents: number,
  locale: string | null | undefined
) {
  const discountValue = Number(coupon.discount_value);
  const minimumOrderAmount = Number(coupon.min_order_amount);
  const maximumDiscountAmount = coupon.max_discount_amount === null
    ? null
    : Number(coupon.max_discount_amount);

  if (
    !Number.isFinite(discountValue)
    || discountValue <= 0
    || (coupon.discount_type === "percentage" && discountValue > 100)
    || (coupon.discount_type !== "percentage" && coupon.discount_type !== "fixed")
    || !Number.isFinite(minimumOrderAmount)
    || minimumOrderAmount < 0
    || (maximumDiscountAmount !== null && (!Number.isFinite(maximumDiscountAmount) || maximumDiscountAmount < 0))
  ) {
    throw new PricingError("COUPON_UNAVAILABLE", "Coupon unavailable");
  }

  if (coupon.user_id && coupon.user_id !== userId) {
    throw new PricingError("COUPON_NOT_ALLOWED", "Coupon unavailable");
  }

  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    throw new PricingError("COUPON_USAGE_LIMIT", "Coupon usage limit reached");
  }

  if (coupon.is_first_order_only) {
    if (!userId) {
      throw new PricingError("COUPON_LOGIN_REQUIRED", "Login is required for this coupon");
    }

    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("payment_status", ["paid", "refunded", "partially_refunded"]);

    if (error) throw new PricingError("COUPON_UNAVAILABLE", "Coupon unavailable");
    if ((count || 0) > 0) {
      throw new PricingError("COUPON_FIRST_ORDER_ONLY", "Coupon is valid for the first order only");
    }
  }

  const minimumCents = toCents(minimumOrderAmount);
  if (subtotalCents < minimumCents) {
    throw new PricingError(
      "COUPON_MINIMUM_NOT_MET",
      formatMinimumOrderMessage(minimumCents, locale)
    );
  }
}

function calculateDiscountCents(coupon: Coupon, subtotalCents: number): number {
  let discountCents = coupon.discount_type === "percentage"
    ? Math.round(subtotalCents * Number(coupon.discount_value) / 100)
    : toCents(coupon.discount_value);

  if (coupon.max_discount_amount !== null) {
    discountCents = Math.min(discountCents, toCents(coupon.max_discount_amount));
  }

  return Math.min(Math.max(0, discountCents), subtotalCents);
}

function formatMinimumOrderMessage(minimumCents: number, locale: string | null | undefined): string {
  const amount = fromCents(minimumCents).toFixed(2).replace(".", locale === "fr" ? "," : ".");
  return locale === "en"
    ? `Minimum order of €${amount} required`
    : `Le minimum de commande est de ${amount} €`;
}

export async function getPricingQuote(
  supabase: PricingClient,
  rawItems: unknown,
  options: {
    couponId?: string | null;
    couponCode?: string | null;
    userId?: string | null;
    locale?: string | null;
  } = {}
): Promise<PricingQuote> {
  const items = parseItems(rawItems);
  const ids = items.map((item) => item.id);

  const [
    { data: products, error: productsError },
    { data: settings, error: settingsError },
  ] = await Promise.all([
    supabase
      .from("products_with_discount")
      .select("id, price, discounted_price, translations")
      .in("id", ids)
      .eq("is_active", true),
    supabase
      .from("store_settings")
      .select("preparation_fee, min_order_amount")
      .limit(1)
      .maybeSingle(),
  ]);

  if (productsError || !products || products.length !== items.length) {
    throw new PricingError("PRODUCT_UNAVAILABLE", "One or more products are unavailable");
  }
  if (settingsError) {
    throw new PricingError("SETTINGS_UNAVAILABLE", "Store settings are unavailable");
  }

  const productById = new Map(
    (products as ProductRow[]).map((product) => [product.id, product])
  );
  const language = options.locale === "en" ? "en" : "fr";
  const quoteItems: PricingQuoteItem[] = items.map((item) => {
    const product = productById.get(item.id);
    if (!product) {
      throw new PricingError("PRODUCT_UNAVAILABLE", "One or more products are unavailable");
    }

    const basePriceCents = toCents(product.price);
    const discountedPriceCents = product.discounted_price === null
      ? null
      : toCents(product.discounted_price);
    const unitPriceCents = discountedPriceCents !== null && discountedPriceCents < basePriceCents
      ? discountedPriceCents
      : basePriceCents;

    return {
      product_id: product.id,
      product_name: product.translations?.[language]?.name || product.id,
      quantity: item.quantity,
      unit_price_cents: unitPriceCents,
      total_price_cents: unitPriceCents * item.quantity,
    };
  });

  const subtotalCents = quoteItems.reduce(
    (sum, item) => sum + item.total_price_cents,
    0
  );
  const preparationFeeCents = toCents(settings?.preparation_fee || 0);

  // The minimum is configured by an administrator in the store settings.
  const configuredMinimumCents = settings?.min_order_amount === null || settings?.min_order_amount === undefined
    ? 0
    : toCents(settings.min_order_amount, "SETTINGS_UNAVAILABLE");
  const minimumOrderCents = configuredMinimumCents;
  if (subtotalCents < minimumOrderCents) {
    throw new PricingError(
      "MIN_ORDER_NOT_MET",
      formatMinimumOrderMessage(minimumOrderCents, options.locale)
    );
  }

  const coupon = await getCoupon(supabase, options.couponId, options.couponCode);
  let discountCents = 0;

  if (coupon) {
    await assertCouponAllowed(supabase, coupon, options.userId, subtotalCents, options.locale);
    discountCents = calculateDiscountCents(coupon, subtotalCents);
  }

  return {
    currency: PRICING_CURRENCY,
    items: quoteItems,
    subtotal_cents: subtotalCents,
    preparation_fee_cents: preparationFeeCents,
    discount_cents: discountCents,
    total_cents: subtotalCents + preparationFeeCents - discountCents,
    coupon: coupon ? { id: coupon.id, code: coupon.code } : null,
  };
}

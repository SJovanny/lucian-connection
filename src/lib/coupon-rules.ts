type CouponRuleInput = {
  code?: unknown;
  description?: unknown;
  discount_type?: unknown;
  discount_value?: unknown;
  min_order_amount?: unknown;
  max_discount_amount?: unknown;
  starts_at?: unknown;
  expires_at?: unknown;
  usage_limit?: unknown;
  is_first_order_only?: unknown;
  is_active?: unknown;
};

export type NormalizedCouponData = {
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  starts_at: string;
  expires_at: string | null;
  usage_limit: number | null;
  is_first_order_only: boolean;
  is_active: boolean;
};

export class CouponRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CouponRuleError";
  }
}

function parseAmount(value: unknown, field: string, minimum = 0): number {
  if (typeof value !== "number") {
    throw new CouponRuleError(`${field} must be a valid amount`);
  }
  const amount = value;
  if (!Number.isFinite(amount) || amount < minimum) {
    throw new CouponRuleError(`${field} must be a valid amount`);
  }
  const cents = Math.round(amount * 100);
  if (!Number.isSafeInteger(cents)) {
    throw new CouponRuleError(`${field} must be a valid amount`);
  }
  return cents / 100;
}

function parseOptionalAmount(value: unknown, field: string): number | null {
  if (value === null || value === undefined || value === "") return null;
  return parseAmount(value, field);
}

function parseDate(value: unknown, field: string, fallback: string | null): string | null {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string" || Number.isNaN(new Date(value).getTime())) {
    throw new CouponRuleError(`${field} must be a valid date`);
  }
  return new Date(value).toISOString();
}

function parseUsageLimit(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw new CouponRuleError("usage_limit must be a positive integer");
  }
  return value;
}

export function normalizeCouponData(
  input: CouponRuleInput,
  existing: Partial<NormalizedCouponData> = {}
): NormalizedCouponData {
  const codeValue = input.code === undefined ? existing.code : input.code;
  const code = typeof codeValue === "string" ? codeValue.trim().toUpperCase() : "";
  if (code.length < 3) throw new CouponRuleError("code must contain at least 3 characters");

  const discountType = input.discount_type === undefined
    ? existing.discount_type
    : input.discount_type;
  if (discountType !== "percentage" && discountType !== "fixed") {
    throw new CouponRuleError("discount_type is invalid");
  }

  const discountValue = parseAmount(
    input.discount_value === undefined ? existing.discount_value : input.discount_value,
    "discount_value",
    Number.EPSILON
  );
  if (discountType === "percentage" && discountValue > 100) {
    throw new CouponRuleError("percentage discounts cannot exceed 100");
  }

  const minOrderAmount = parseAmount(
    input.min_order_amount === undefined ? existing.min_order_amount ?? 0 : input.min_order_amount,
    "min_order_amount"
  );
  const maxDiscountAmount = parseOptionalAmount(
    input.max_discount_amount === undefined ? existing.max_discount_amount : input.max_discount_amount,
    "max_discount_amount"
  );
  const startsAt = parseDate(
    input.starts_at === undefined ? existing.starts_at : input.starts_at,
    "starts_at",
    new Date().toISOString()
  );
  const expiresAt = parseDate(
    input.expires_at === undefined ? existing.expires_at : input.expires_at,
    "expires_at",
    null
  );

  if (startsAt && expiresAt && new Date(startsAt) > new Date(expiresAt)) {
    throw new CouponRuleError("expires_at must be after starts_at");
  }

  const descriptionValue = input.description === undefined ? existing.description : input.description;
  const firstOrderValue = input.is_first_order_only === undefined
    ? existing.is_first_order_only
    : input.is_first_order_only;
  const activeValue = input.is_active === undefined ? existing.is_active : input.is_active;

  if (descriptionValue !== undefined && descriptionValue !== null && typeof descriptionValue !== "string") {
    throw new CouponRuleError("description must be text");
  }
  if (firstOrderValue !== undefined && typeof firstOrderValue !== "boolean") {
    throw new CouponRuleError("is_first_order_only must be a boolean");
  }
  if (activeValue !== undefined && typeof activeValue !== "boolean") {
    throw new CouponRuleError("is_active must be a boolean");
  }

  return {
    code,
    description: descriptionValue ? String(descriptionValue).trim() || null : null,
    discount_type: discountType,
    discount_value: discountValue,
    min_order_amount: minOrderAmount,
    max_discount_amount: maxDiscountAmount,
    starts_at: startsAt || new Date().toISOString(),
    expires_at: expiresAt,
    usage_limit: parseUsageLimit(
      input.usage_limit === undefined ? existing.usage_limit : input.usage_limit
    ),
    is_first_order_only: firstOrderValue === true,
    is_active: activeValue !== false,
  };
}

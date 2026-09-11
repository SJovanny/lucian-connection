import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const localeSchema = z.enum(["fr", "en"]);

const categoryTranslationSchema = z.object({
  name: z.string().trim().min(1).max(120),
}).strict();

const imageUrlSchema = z.union([
  z.literal("").transform(() => null),
  z.string().max(7 * 1024 * 1024).refine((value) => {
    if (value.startsWith("data:image/")) return true;
    try {
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  }),
  z.null(),
]);

const categoryFields = {
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  image_url: imageUrlSchema,
  display_order: z.number().int().min(0).max(10_000),
  translations: z.object({
    fr: categoryTranslationSchema,
    en: categoryTranslationSchema,
  }).strict(),
};

export const categoryCreateSchema = z.object(categoryFields).strict();
export const categoryUpdateSchema = z.object(categoryFields).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  "At least one category field is required"
);

export const stockUpdateSchema = z.object({
  productId: uuidSchema,
  stock: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
}).strict();

export const featuredProductSchema = z.object({
  productId: uuidSchema,
  isFeatured: z.boolean(),
}).strict();

const allergenListSchema = z.union([
  z.string().max(2_000).transform((value) => value.split(",")),
  z.array(z.string()).max(100),
]).transform((items) => items.map((item) => item.trim()).filter(Boolean));

const productFields = {
  name_fr: z.string().trim().min(1).max(160),
  name_en: z.string().trim().min(1).max(160),
  description_fr: z.string().trim().max(5_000),
  description_en: z.string().trim().max(5_000),
  allergens_fr: allergenListSchema,
  allergens_en: allergenListSchema,
  category_id: uuidSchema.nullable(),
  price: z.number().min(0).max(1_000_000),
  unit: z.string().trim().max(80).transform((value) => value || "each"),
  stock: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  low_stock_threshold: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  track_stock: z.boolean(),
  is_alcoholic: z.boolean(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  image_url: imageUrlSchema,
};

export const productCreateSchema = z.object(productFields).strict();
export const productUpdateSchema = z.object(productFields).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  "At least one product field is required"
);

export const couponInputSchema = z.object({
  code: z.string().trim().min(3).max(64).optional(),
  description: z.string().trim().max(1_000).nullable().optional(),
  discount_type: z.enum(["percentage", "fixed"]).optional(),
  discount_value: z.number().positive().optional(),
  min_order_amount: z.number().min(0).optional(),
  max_discount_amount: z.number().min(0).nullable().optional(),
  starts_at: z.string().datetime({ offset: true }).nullable().optional(),
  expires_at: z.string().datetime({ offset: true }).nullable().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  is_first_order_only: z.boolean().optional(),
  is_active: z.boolean().optional(),
}).strict();

export const productIdsSchema = z.object({
  product_ids: z.array(uuidSchema).min(1).max(100),
}).strict();

export const loyaltyRedemptionSchema = z.object({
  reward_id: uuidSchema,
}).strict();

export const pickupClosureSchema = z.object({
  closed_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().max(500).nullable().optional(),
}).strict();

export const pickupUpdateSchema = z.object({
  pickup_at: z.string().datetime({ offset: true }),
}).strict();

const positivePageSchema = z.string().regex(/^\d+$/).transform(Number).pipe(
  z.number().int().min(1).max(Number.MAX_SAFE_INTEGER)
);

export const auditLogQuerySchema = z.object({
  page: positivePageSchema.default(1),
  pageSize: positivePageSchema.pipe(z.number().max(100)).default(25),
  actorId: uuidSchema.optional(),
  entityType: z.enum([
    "product",
    "category",
    "coupon",
    "reduction",
    "order",
    "store_settings",
    "pickup_opening_hours",
    "pickup_closure",
    "loyalty_reward",
    "user",
    "auth",
  ]).optional(),
  from: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    z.string().datetime({ offset: true }),
  ]).optional(),
  to: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    z.string().datetime({ offset: true }),
  ]).optional(),
}).strict();

export const cartItemSchema = z.object({
  id: uuidSchema,
  quantity: z.number().int().min(1).max(100),
}).strict();

export const pricingRequestSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(100),
  couponId: uuidSchema.nullish(),
  couponCode: z.string().trim().min(1).max(64).nullish(),
  locale: localeSchema.default("fr"),
}).strict();

export const couponValidationSchema = z.object({
  code: z.string().trim().min(1).max(64),
  items: z.array(cartItemSchema).min(1).max(100),
  locale: localeSchema.default("fr"),
}).strict();

const pickupTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[03]0$/);
const openingHourSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  is_open: z.boolean(),
  start_time: pickupTimeSchema.nullable(),
  end_time: pickupTimeSchema.nullable(),
}).strip().superRefine((value, context) => {
  if (value.is_open && (!value.start_time || !value.end_time || value.start_time >= value.end_time)) {
    context.addIssue({ code: "custom", message: "Open days require an ordered time range" });
  }
  if (!value.is_open && (value.start_time !== null || value.end_time !== null)) {
    context.addIssue({ code: "custom", message: "Closed days cannot contain hours" });
  }
});

export const openingHoursUpdateSchema = z.object({
  openingHours: z.array(openingHourSchema).length(7).refine(
    (rows) => new Set(rows.map((row) => row.weekday)).size === 7,
    "Each weekday must appear exactly once"
  ),
}).strict();

export function normalizeSearchQuery(value: string | null): string | null {
  if (value === null) return null;
  const normalized = value.normalize("NFKC").trim().replace(/\s+/g, " ");
  if (normalized.length < 2) return null;
  const parsed = z.string().max(160).refine(
    (query) => !/[\u0000-\u001f\u007f]/.test(query),
    "Search query contains control characters"
  ).safeParse(normalized);
  if (!parsed.success) throw new ApiSearchQueryError();
  return parsed.data;
}

export function toPostgrestIlikePattern(query: string): string {
  const literal = query.replace(/\\/g, "\\\\").replace(/[%_]/g, "\\$&");
  // PostgREST translates '*' even inside quoted ILIKE values.
  if (literal.includes("*")) throw new ApiSearchQueryError();
  const pattern = `%${literal}%`;
  return `"${pattern.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export class ApiSearchQueryError extends Error {
  constructor() {
    super("INVALID_SEARCH_QUERY");
    this.name = "ApiSearchQueryError";
  }
}

import { z } from "zod";
import { cartItemSchema } from "@/lib/api-schemas";

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(100),
  phone: z.string().trim().min(1).max(32),
  notes: z.string().trim().max(2000).nullish(),
  locale: z.enum(["fr", "en"]).default("fr"),
  pickup_at: z.string().datetime({ offset: true }),
  coupon_id: z.string().uuid().nullish(),
  quote_total_cents: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
  full_name: z.string().trim().min(1).max(200),
  email: z.string().trim().max(254).email().optional(),
  terms_accepted: z.literal(true),
  age_confirmed: z.boolean().optional(),
}).strict();

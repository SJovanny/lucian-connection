import { describe, expect, it } from "vitest";
import {
  auditLogQuerySchema,
  categoryCreateSchema,
  couponInputSchema,
  normalizeSearchQuery,
  openingHoursUpdateSchema,
  productCreateSchema,
  stockUpdateSchema,
  toPostgrestIlikePattern,
} from "@/lib/api-schemas";

describe("API schemas", () => {
  it("rejects category mass-assignment fields", () => {
    expect(categoryCreateSchema.safeParse({
      id: "018f2d3e-1234-7abc-8def-1234567890ab",
      slug: "fresh-food",
      image_url: null,
      display_order: 1,
      translations: { fr: { name: "Frais" }, en: { name: "Fresh" } },
    }).success).toBe(false);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, "2"])(
    "rejects invalid stock %s",
    (stock) => {
      expect(stockUpdateSchema.safeParse({
        productId: "018f2d3e-1234-7abc-8def-1234567890ab",
        stock,
      }).success).toBe(false);
    }
  );

  it("rejects truthy strings as opening-hour booleans", () => {
    const openingHours = Array.from({ length: 7 }, (_, weekday) => ({
      weekday,
      is_open: weekday === 0 ? "false" : false,
      start_time: null,
      end_time: null,
    }));
    expect(openingHoursUpdateSchema.safeParse({ openingHours }).success).toBe(false);
  });

  it("strips read-only fields returned by the opening-hours API", () => {
    const openingHours = Array.from({ length: 7 }, (_, weekday) => ({
      id: `row-${weekday}`,
      weekday,
      is_open: false,
      start_time: null,
      end_time: null,
      updated_at: "2026-09-11T00:00:00Z",
    }));
    const parsed = openingHoursUpdateSchema.parse({ openingHours });
    expect(parsed.openingHours[0]).toEqual({
      weekday: 0,
      is_open: false,
      start_time: null,
      end_time: null,
    });
  });

  it("accepts offset coupon timestamps emitted by the form", () => {
    expect(couponInputSchema.safeParse({
      starts_at: "2026-09-11T10:30:00-04:00",
      expires_at: null,
    }).success).toBe(true);
  });

  it("accepts a zero-price product and normalizes a blank unit", () => {
    const result = productCreateSchema.safeParse({
      name_fr: "Produit",
      name_en: "Product",
      description_fr: "",
      description_en: "",
      allergens_fr: "",
      allergens_en: "",
      category_id: null,
      price: 0,
      unit: "",
      stock: 0,
      low_stock_threshold: 0,
      track_stock: false,
      is_alcoholic: false,
      is_active: true,
      is_featured: false,
      image_url: null,
    });
    expect(result.success && result.data.unit).toBe("each");
  });

  it("accepts date-only audit filters", () => {
    expect(auditLogQuerySchema.safeParse({
      from: "2026-09-01",
      to: "2026-09-11",
    }).success).toBe(true);
  });

  it("turns malformed category URLs into validation failures", () => {
    expect(() => categoryCreateSchema.safeParse({
      slug: "fresh-food",
      image_url: "not-a-url",
      display_order: 1,
      translations: { fr: { name: "Frais" }, en: { name: "Fresh" } },
    })).not.toThrow();
  });
});

describe("normalizeSearchQuery", () => {
  it("normalizes a safe Unicode search term", () => {
    expect(normalizeSearchQuery("  Crème   fraîche ")).toBe("Crème fraîche");
  });

  it.each(["Coca-Cola 1.5L", "Salt & pepper", "Plantain (ripe)"])(
    "preserves legitimate punctuation in %s",
    (query) => {
      expect(normalizeSearchQuery(query)).toBe(query);
    }
  );

  it("quotes and escapes PostgREST filter syntax", () => {
    const encoded = toPostgrestIlikePattern('name),id.eq.secret_100%"');
    const decoded = encoded.slice(1, -1).replace(/\\(.)/g, "$1");
    expect(decoded).toBe('%name),id.eq.secret\\_100\\%"%');
  });

  it("treats a one-character query as empty", () => {
    expect(normalizeSearchQuery("x")).toBeNull();
  });
});

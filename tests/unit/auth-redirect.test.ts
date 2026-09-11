import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "@/lib/auth-redirect";

describe("getSafeRedirectPath", () => {
  it.each([null, "", "https://example.com", "//example.com", "/\\example.com"])(
    "rejects unsafe redirect %s",
    (value) => {
      expect(getSafeRedirectPath(value)).toBe("/");
    }
  );

  it.each(["/checkout", "/admin/orders", "/en/products?category=food"])(
    "preserves local redirect %s",
    (value) => {
      expect(getSafeRedirectPath(value)).toBe(value);
    }
  );
});

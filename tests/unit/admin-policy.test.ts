import { describe, expect, it } from "vitest";
import {
  getCanonicalAdminPath,
  hasRequiredStaffRole,
  isStaffRole,
} from "@/lib/admin-policy";

describe("admin role policy", () => {
  it.each(["admin", "employee"])("allows %s into operational admin pages", (role) => {
    expect(isStaffRole(role)).toBe(true);
    expect(hasRequiredStaffRole(role, "staff")).toBe(true);
  });

  it.each([null, undefined, "customer", "", "administrator"])(
    "denies unknown role %s",
    (role) => {
      expect(isStaffRole(role)).toBe(false);
      expect(hasRequiredStaffRole(role, "staff")).toBe(false);
      expect(hasRequiredStaffRole(role, "admin")).toBe(false);
    }
  );

  it("keeps strict operations admin-only", () => {
    expect(hasRequiredStaffRole("admin", "admin")).toBe(true);
    expect(hasRequiredStaffRole("employee", "admin")).toBe(false);
  });
});

describe("admin route policy", () => {
  it.each([
    ["/fr/admin", "/admin"],
    ["/en/admin", "/admin"],
    ["/fr/admin/coupons", "/admin/coupons"],
    ["/en/admin/coupons/new", "/admin/coupons/new"],
  ])("canonicalizes %s", (pathname, expected) => {
    expect(getCanonicalAdminPath(pathname)).toBe(expected);
  });

  it.each(["/admin", "/fr/products", "/en/account", "/api/admin/orders"])(
    "leaves canonical or public path %s unchanged",
    (pathname) => {
      expect(getCanonicalAdminPath(pathname)).toBeNull();
    }
  );
});

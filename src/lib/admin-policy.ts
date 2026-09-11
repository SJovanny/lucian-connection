import { locales } from "@/i18n/locales";

export type StaffRole = "admin" | "employee";
export type RequiredStaffRole = "staff" | "admin";

export function isStaffRole(role: unknown): role is StaffRole {
  return role === "admin" || role === "employee";
}

export function hasRequiredStaffRole(
  role: unknown,
  requiredRole: RequiredStaffRole
): role is StaffRole {
  return requiredRole === "admin" ? role === "admin" : isStaffRole(role);
}

export function getCanonicalAdminPath(pathname: string): string | null {
  for (const locale of locales) {
    const prefix = `/${locale}/admin`;
    if (pathname === prefix) return "/admin";
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(locale.length + 1);
  }

  return null;
}

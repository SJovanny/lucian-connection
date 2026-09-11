import { NextRequest, NextResponse } from "next/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const { createServerClientMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(
    (_url: string, _key: string, options: { cookies: { setAll: (cookies: Array<{ name: string; value: string; options: Record<string, unknown> }>) => void } }) => ({
      auth: {
        getUser: async () => {
          options.cookies.setAll([
            {
              name: "sb-session",
              value: "refreshed",
              options: { httpOnly: true, sameSite: "lax" },
            },
          ]);
          return { data: { user: null }, error: null };
        },
      },
    })
  ),
}));

vi.mock("next-intl/middleware", () => ({
  default: () => () => NextResponse.next(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

describe("admin proxy routing", () => {
  let proxy: typeof import("@/proxy").proxy;
  let config: typeof import("@/proxy").config;

  beforeAll(async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
    ({ proxy, config } = await import("@/proxy"));
  });

  afterAll(() => vi.unstubAllEnvs());

  it("redirects localized admin URLs to the protected canonical tree", async () => {
    const response = await proxy(
      new NextRequest("https://shop.example/fr/admin/coupons?status=active")
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://shop.example/admin/coupons?status=active"
    );
  });

  it("explicitly matches every canonical admin path", () => {
    expect(config.matcher).toContain("/admin/:path*");
  });

  it("forwards refreshed session cookies to the response and request", async () => {
    const response = await proxy(new NextRequest("https://shop.example/api/store-settings"));

    expect(response.headers.get("set-cookie")).toContain("sb-session=refreshed");
    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      "sb-session=refreshed"
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { routing } from "@/i18n/config";

vi.mock("next-intl/server", () => ({ getLocale: vi.fn() }));
vi.mock("@/i18n/routing", () => ({ redirect: vi.fn() }));

describe("root page fallback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps locale detection enabled with prefixed URLs and a French fallback", () => {
    expect(routing.localeDetection).toBe(true);
    expect(routing.localePrefix).toBe("always");
    expect(routing.defaultLocale).toBe("fr");
    expect(routing.locales).toEqual(["fr", "en"]);
  });

  it.each(["fr", "en"])("redirects to the detected %s homepage", async (locale) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    const redirectSignal = new Error("NEXT_REDIRECT");
    vi.mocked(redirect).mockImplementation(() => { throw redirectSignal; });

    await expect(Home()).rejects.toBe(redirectSignal);
    expect(redirect).toHaveBeenCalledExactlyOnceWith({ href: "/", locale });
  });
});

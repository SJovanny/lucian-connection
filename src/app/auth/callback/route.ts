import { NextRequest, NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";
import { locales, type Locale } from "@/i18n/routing";

function getLocale(value: string | null): Locale {
  return value && locales.includes(value as Locale) ? (value as Locale) : "fr";
}

function removeLocalePrefix(path: string): string {
  for (const locale of locales) {
    if (path === `/${locale}`) return "/";
    if (path.startsWith(`/${locale}/`)) return path.slice(locale.length + 1);
  }

  return path;
}

function getLocalizedRedirectPath(locale: Locale, nextPath: string): string {
  const path = removeLocalePrefix(nextPath);
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

function getLoginRedirect(
  request: NextRequest,
  locale: Locale,
  nextPath: string,
  error: "cancelled" | "failed"
) {
  const loginUrl = new URL(`/${locale}/login`, request.url);
  loginUrl.searchParams.set("oauth", error);

  if (nextPath !== "/") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = getLocale(searchParams.get("locale"));
  const nextPath = getSafeRedirectPath(searchParams.get("next"));
  const providerError = searchParams.get("error");

  if (providerError) {
    return getLoginRedirect(
      request,
      locale,
      nextPath,
      providerError === "access_denied" ? "cancelled" : "failed"
    );
  }

  const code = searchParams.get("code");
  if (!code) {
    return getLoginRedirect(request, locale, nextPath, "failed");
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return getLoginRedirect(request, locale, nextPath, "failed");
    }

   const destination = nextPath.startsWith("/admin") || nextPath.startsWith("/auth")
     ? nextPath
     : getLocalizedRedirectPath(locale, nextPath);
    return NextResponse.redirect(new URL(destination, request.url));
  } catch {
    return getLoginRedirect(request, locale, nextPath, "failed");
  }
}

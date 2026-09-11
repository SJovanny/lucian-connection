import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/config';
import { getSupabaseConfig } from './lib/supabase/config';
import { getCanonicalAdminPath, isStaffRole } from './lib/admin-policy';

const intlMiddleware = createMiddleware(routing);

function copyCookies(source: NextResponse, target: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const canonicalAdminPath = getCanonicalAdminPath(pathname);
  if (canonicalAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = canonicalAdminPath;
    return NextResponse.redirect(url, 308);
  }

  // Create a response to modify with pathname header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // The OAuth route exchanges the PKCE code and writes the session cookies itself.
  // It must not be redirected by next-intl before that exchange happens.
  if (
    pathname === '/auth/callback' ||
    pathname === '/auth/callback/' ||
    pathname === '/auth/set-password' ||
    pathname === '/auth/set-password/'
  ) {
    return response;
  }

  const supabaseConfig = getSupabaseConfig();

  // Auth is optional for public preview pages when Supabase is not configured.
  if (!supabaseConfig) {
    if (pathname.startsWith('/api') || pathname.startsWith('/admin')) {
      return response;
    }

    return intlMiddleware(request);
  }

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    supabaseConfig.url,
    supabaseConfig.key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          requestHeaders.set('cookie', request.cookies.toString());
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser();

  // Handle admin routes protection
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      // If already logged in as admin, redirect to dashboard
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (isStaffRole(profile?.role)) {
          return copyCookies(response, NextResponse.redirect(new URL('/admin', request.url)));
        }
      }
      return response;
    }

    // For all other admin routes, check if user is admin
    if (!user) {
      return copyCookies(response, NextResponse.redirect(new URL('/admin/login', request.url)));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!isStaffRole(profile?.role)) {
      return copyCookies(response, NextResponse.redirect(new URL('/admin/login', request.url)));
    }

    if (pathname === '/admin/users' || pathname.startsWith('/admin/users/')) {
      if (String(profile?.role) !== 'admin') {
        return copyCookies(response, NextResponse.redirect(new URL('/admin', request.url)));
      }
    }

    return response;
  }

  // Skip i18n middleware for API routes
  if (pathname.startsWith('/api')) {
    return response;
  }

  // Apply i18n middleware
  const intlResponse = intlMiddleware(request);
  
  // Copy auth cookies to intl response
  copyCookies(response, intlResponse);

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - Static files (favicon, images, etc.)
    '/((?!_next|_vercel|.*\\..*).*)',
    '/admin/:path*',
  ],
};

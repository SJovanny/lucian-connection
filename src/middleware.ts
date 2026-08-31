import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';
import { getSupabaseConfig } from './lib/supabase/config';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Create a response to modify with pathname header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
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

        if (String(profile?.role) === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
      return response;
    }

    // For all other admin routes, check if user is admin
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (String(profile?.role) !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
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
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      ...cookie,
    });
  });

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - Static files (favicon, images, etc.)
    '/((?!_next|_vercel|.*\\..*).*)',
    // Also match admin routes
    '/admin/:path*',
  ],
};

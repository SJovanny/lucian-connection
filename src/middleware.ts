import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, skip auth handling so the site still renders.
  // Admin routes remain protected by bouncing to the login page.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (pathname.startsWith('/api')) {
      return response;
    }
    return intlMiddleware(request);
  }

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

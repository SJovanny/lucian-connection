import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip i18n middleware for admin routes and API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /admin (Admin dashboard - French only)
    // - Static files (favicon, images, etc.)
    '/((?!api|_next|_vercel|admin|.*\\..*).*)',
  ],
};

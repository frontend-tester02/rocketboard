import { NextResponse, type NextRequest } from 'next/server';

// Pages reachable without authentication.
const AUTH_PAGES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/lock-screen',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = req.cookies.has('access_token');
  const isAuthPage = AUTH_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  // Not signed in → send protected routes to /login (remembering the target).
  if (!hasToken && !isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Already signed in → keep users out of the auth pages.
  if (hasToken && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static files (those contain a dot).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};

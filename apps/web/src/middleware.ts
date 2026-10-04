import { NextResponse, type NextRequest } from 'next/server';

// Pages reachable without authentication.
const PUBLIC_AUTH_PAGES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = req.cookies.has('access_token');
  const isLocked = req.cookies.has('locked');
  const isLockScreen = pathname === '/lock-screen';
  const isPublicAuth = PUBLIC_AUTH_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  // Not signed in.
  if (!hasToken) {
    if (isPublicAuth) return NextResponse.next();
    // Protected routes (incl. /lock-screen) → login, remembering the target.
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    if (!isLockScreen) url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Signed in but locked → force the lock screen.
  if (isLocked) {
    if (isLockScreen) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/lock-screen';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Signed in and unlocked → keep out of auth pages / lock screen.
  if (isPublicAuth || isLockScreen) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};

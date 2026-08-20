import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// Routes that REQUIRE authentication (history and saved require logged-in account)
// Settings is accessible in Read-Only mode for guests
const PROTECTED = ['/history', '/saved'];

export default auth(function proxy(req) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isLoggedIn = !!req.auth;

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from /login
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

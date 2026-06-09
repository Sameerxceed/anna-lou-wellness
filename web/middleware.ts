import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge middleware — auth gate for logged-in routes.
 *
 * Approach:
 * - We can't run Strapi fetch reliably from middleware (Edge runtime, no DNS for internal hosts in some setups).
 * - So we do a lightweight check: presence of the `rr_session` cookie.
 * - If absent → redirect to /login (with return URL).
 * - The actual role/flag check (reset-room-member, hasRegulatedAccess) happens
 *   server-side inside each page via getSession(). Pages call
 *   `if (!session?.isMember) redirect('/community/reset-room')`.
 *
 * This split keeps the middleware fast and the auth strict at the page level.
 *
 * /account is for ANY logged-in user (shop customer, member, course buyer).
 * /community/reset-room/* is gated AGAIN at page level for members only.
 * /the-work/regulated/access is gated AGAIN at page level for hasRegulatedAccess.
 */

const SESSION_COOKIE = 'rr_session';

const PROTECTED_PREFIXES = [
  '/account',
  '/community/reset-room/dashboard',
  '/community/reset-room/vault',
  '/community/reset-room/replays',
  '/community/reset-room/account',
  '/the-work/regulated/access',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
    '/account',
    '/community/reset-room/dashboard/:path*',
    '/community/reset-room/vault/:path*',
    '/community/reset-room/replays/:path*',
    '/community/reset-room/account/:path*',
    '/the-work/regulated/access/:path*',
  ],
};

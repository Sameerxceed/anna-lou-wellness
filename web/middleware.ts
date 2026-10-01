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

// Hostnames we treat as non-production. Must stay in sync with the
// Coolify FQDN list. Any request on these gets a sitewide noindex header
// so Google / Bing / AI crawlers never index the duplicate copy. Anna
// 25 Sep: staging.annalouwellness.com was publicly indexed and appeared
// above the live site for the Big Exhale retreat. Blocking at the HTTP
// header level is faster than robots.txt alone and covers API routes too.
const NON_INDEXABLE_HOSTS = new Set([
  'staging.annalouwellness.com',
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get('host')?.toLowerCase() || '';
  const isNonIndexable = NON_INDEXABLE_HOSTS.has(host);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isProtected) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      const res = NextResponse.redirect(loginUrl);
      if (isNonIndexable) res.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return res;
    }
  }

  const res = NextResponse.next();
  if (isNonIndexable) res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  // Run on every request so the X-Robots-Tag goes out sitewide on
  // non-indexable hosts. The protected-route auth check is a cheap
  // string compare, no DB call, so the overhead per request is tiny.
  matcher: [
    // Everything except static assets, _next internals, and favicons.
    // Matches the Next.js recommended "sitewide middleware" pattern.
    '/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.png|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.webp$|.*\\.ico$).*)',
  ],
};

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth';

function clearAndRedirect(req: NextRequest, fallback = '/') {
  const next = req.nextUrl.searchParams.get('next') || fallback;
  // Only allow relative redirects (no off-site).
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : fallback;
  const res = NextResponse.redirect(new URL(safeNext, req.url));
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}

// GET handles plain `<a href="/api/auth/logout">Sign out</a>` links + the
// optional ?next= query for where to land after.
export async function GET(req: NextRequest) {
  return clearAndRedirect(req);
}

// POST kept for fetch()-based logout from client components.
export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  // Return JSON so client code can react; redirect not used in this path.
  return res;
}

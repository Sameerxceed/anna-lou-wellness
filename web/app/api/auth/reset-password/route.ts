import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_COOKIE_MAX_AGE } from '@/lib/auth';

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Finish a password reset / first-time set-password flow.
 *
 * Body: { code, password, passwordConfirmation }
 *
 * Strapi's /api/auth/reset-password accepts the token (which we wrote to
 * user.resetPasswordToken via the admin API in generateResetToken) and
 * issues a fresh JWT on success. We drop that JWT into the rr_session
 * cookie so the user lands logged in.
 */
export async function POST(req: NextRequest) {
  let body: { code?: string; password?: string; passwordConfirmation?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const code = (body.code || '').trim();
  const password = body.password || '';
  const passwordConfirmation = body.passwordConfirmation || '';

  if (!code) return NextResponse.json({ error: 'Reset link is invalid or expired.' }, { status: 400 });
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }
  if (password !== passwordConfirmation) {
    return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, password, passwordConfirmation }),
      cache: 'no-store',
    });
    if (!res.ok) {
      const txt = await res.text();
      console.warn('[reset-password] Strapi rejected:', res.status, txt.slice(0, 300));
      return NextResponse.json(
        { error: 'Could not set your password. The link may have expired.' },
        { status: 400 },
      );
    }
    const data = await res.json();
    const jwt = data?.jwt as string | undefined;
    if (!jwt) {
      return NextResponse.json({ error: 'No session returned' }, { status: 502 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_COOKIE_MAX_AGE,
    });
    return response;
  } catch (err: any) {
    console.error('[reset-password] error:', err?.message);
    return NextResponse.json({ error: 'Network error. Please try again.' }, { status: 502 });
  }
}

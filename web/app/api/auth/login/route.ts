import { NextRequest, NextResponse } from 'next/server';
import { loginWithStrapi, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  try {
    const jwt = await loginWithStrapi(email, password);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_COOKIE_MAX_AGE,
    });
    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json(
      { error: 'Wrong email or password.', detail: msg },
      { status: 401 },
    );
  }
}

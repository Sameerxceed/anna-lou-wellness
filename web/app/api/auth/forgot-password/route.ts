import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/auth';
import { verifyTurnstile } from '@/lib/turnstile';

export async function POST(req: NextRequest) {
  let body: { email?: string; turnstileToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  // Cloudflare Turnstile CAPTCHA — prevents bots from spam-triggering
  // password reset emails against real users (email-bomb attack vector).
  const captcha = await verifyTurnstile(
    body.turnstileToken,
    req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
  );
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  try {
    await requestPasswordReset(email);
    // Always return 200, even if email doesn't exist (don't leak account existence).
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

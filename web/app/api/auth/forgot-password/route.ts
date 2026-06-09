import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstile } from '@/lib/turnstile';
import { findUserByEmail, generateResetToken } from '@/lib/strapi-admin';
import { sendFromTemplate } from '@/lib/email';

/**
 * Customer requests a password reset link.
 *
 * We do NOT use Strapi's built-in /api/auth/forgot-password because Strapi's
 * email plugin isn't configured on this project — the email would silently
 * never leave. Instead we generate the reset token ourselves and send the
 * email via Resend using the password_reset template Anna edits in the CMS.
 *
 * Behaviour:
 * - Always returns 200, even if the email doesn't match a user (don't leak
 *   account existence to scrapers).
 * - CAPTCHA-gated to prevent bot email-bombing.
 */

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://staging.annalouwellness.com';

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

  const captcha = await verifyTurnstile(
    body.turnstileToken,
    req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
  );
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  try {
    const user = await findUserByEmail(email);
    if (user) {
      const token = await generateResetToken(user.id);
      const resetUrl = `${SITE_URL}/login/reset?code=${encodeURIComponent(token)}`;
      const firstName = (user as any).firstName || user.username || email.split('@')[0];
      await sendFromTemplate('password_reset', {
        account: {
          email,
          first_name: firstName,
          reset_password_url: resetUrl,
        },
      });
    }
  } catch (err: any) {
    // Never leak details — but log server-side for debugging.
    console.warn('[forgot-password] error (suppressed from response):', err?.message);
  }

  // Always 200, even if no user. Don't leak existence.
  return NextResponse.json({ ok: true });
}

/**
 * Cloudflare Turnstile — server-side token verification.
 *
 * Use in any API route that receives a Turnstile token from a public form:
 *
 *   import { verifyTurnstile } from '@/lib/turnstile';
 *
 *   const captcha = await verifyTurnstile(body.turnstileToken, req.headers.get('x-forwarded-for'));
 *   if (!captcha.ok) {
 *     return NextResponse.json({ error: captcha.error }, { status: 400 });
 *   }
 *
 * Required env var:
 *   TURNSTILE_SECRET_KEY  — from Cloudflare Turnstile dashboard
 *
 * Fail mode: if env var is missing, verification FAILS (returns ok: false).
 * Better to make misconfiguration loud than to silently bypass CAPTCHA in
 * production. Set the env var in every environment that runs this code.
 *
 * --- Xceed standard ---
 * Generic, reusable across every Xceed Next.js project. Pair with
 * <TurnstileWidget /> on the client side. See template README for the
 * full integration pattern.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileResult {
  ok: boolean;
  error?: string;
  /** Cloudflare's raw response, useful for logging in dev. */
  detail?: unknown;
}

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  if (!token) {
    return { ok: false, error: 'Missing CAPTCHA token. Please complete the verification and try again.' };
  }
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // eslint-disable-next-line no-console
    console.error('[turnstile] TURNSTILE_SECRET_KEY not set — refusing to verify');
    return { ok: false, error: 'Server CAPTCHA not configured.' };
  }

  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  if (remoteIp) form.set('remoteip', remoteIp);

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (data.success) return { ok: true, detail: data };
    return {
      ok: false,
      error: 'CAPTCHA verification failed. Please refresh and try again.',
      detail: data,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[turnstile] verify network error:', err);
    return { ok: false, error: 'CAPTCHA service unreachable. Please try again in a moment.' };
  }
}

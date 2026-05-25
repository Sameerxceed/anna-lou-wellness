'use client';

/**
 * TurnstileWidget — Cloudflare Turnstile CAPTCHA widget.
 *
 * Renders the Turnstile widget inline in a form. Most users see nothing
 * (Cloudflare decides invisible vs challenge based on risk). When the
 * widget produces a token, it calls onVerify(token) — the parent form
 * should store it in state and include it in the POST body. Server-side
 * verifies via lib/turnstile.ts.
 *
 * Usage:
 *
 *   import TurnstileWidget from '@/components/TurnstileWidget';
 *
 *   const [token, setToken] = useState('');
 *   <TurnstileWidget onVerify={setToken} />
 *   // include `turnstileToken: token` in your POST body
 *
 * Required env var (client-side):
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY  — public site key from Cloudflare
 *
 * If the env var isn't set, the widget renders nothing (graceful degrade
 * in local dev). Production MUST set it.
 *
 * --- Xceed standard ---
 * Generic, reusable across every Xceed Next.js project. Pair with
 * lib/turnstile.ts on the server side. See template README for the full
 * integration pattern.
 */

import Script from 'next/script';
import { useEffect, useRef } from 'react';

interface Props {
  /** Called when Cloudflare produces a valid token. Token expires in ~5 min. */
  onVerify: (token: string) => void;
  /** Called if verification fails before producing a token. */
  onError?: () => void;
  /** Called when a previously-issued token expires. */
  onExpire?: () => void;
  /** Visual theme. 'auto' follows OS preference. */
  theme?: 'light' | 'dark' | 'auto';
  /** Visual size of the widget. 'normal' shows the full widget, 'compact' is smaller. */
  size?: 'normal' | 'compact' | 'flexible';
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement | string, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export default function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
  size = 'flexible',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Hold the latest callbacks in refs so the widget doesn't re-render
  // every time the parent passes a new function instance.
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);
  useEffect(() => { onVerifyRef.current = onVerify; }, [onVerify]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  useEffect(() => {
    if (!siteKey) {
      // eslint-disable-next-line no-console
      console.warn('[turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY not set — widget skipped');
      return;
    }
    let cancelled = false;

    const tryRender = (): boolean => {
      if (cancelled) return true;
      if (!window.turnstile || !containerRef.current) return false;
      if (widgetIdRef.current) return true;
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => onVerifyRef.current?.(token),
          'error-callback': () => onErrorRef.current?.(),
          'expired-callback': () => onExpireRef.current?.(),
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[turnstile] render failed:', err);
      }
      return true;
    };

    if (!tryRender()) {
      const interval = setInterval(() => {
        if (tryRender()) clearInterval(interval);
      }, 150);
      return () => {
        cancelled = true;
        clearInterval(interval);
        if (widgetIdRef.current && window.turnstile) {
          try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
          widgetIdRef.current = null;
        }
      };
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, size]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        strategy="afterInteractive"
      />
      <div ref={containerRef} style={{ minHeight: 65 }} />
    </>
  );
}

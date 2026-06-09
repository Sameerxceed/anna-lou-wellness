'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Universal "book now" button.
 *
 * If `url` is a Calendly URL (anything on calendly.com or *.calendly.com),
 * the button opens Calendly's official popup widget inline so the customer
 * stays on the brand site — Calendly handles timezones, availability, and
 * confirmation emails.
 *
 * For any other URL it just opens in a new tab — same behaviour as the
 * previous plain <a> link.
 *
 * If Calendly's script fails to load (network issue, blocked, etc.) the
 * button gracefully degrades to opening the URL in a new tab.
 *
 * Usage:
 *   <BookingButton url={programme.booking_url} label="Book a session" />
 */

const CALENDLY_SCRIPT = 'https://assets.calendly.com/assets/external/widget.js';
const CALENDLY_CSS = 'https://assets.calendly.com/assets/external/widget.css';

export function isCalendlyUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname === 'calendly.com' || u.hostname.endsWith('.calendly.com');
  } catch {
    return false;
  }
}

/**
 * Open a Calendly URL as a popup widget. Useful when you can't wrap a
 * BookingButton — e.g. a whole-card click handler. Returns true if the
 * popup opened, false if Calendly's script couldn't load (caller should
 * fall back to window.open).
 */
export async function openCalendlyPopup(url: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const loaded = await loadCalendlyScript();
  if (loaded && (window as any).Calendly?.initPopupWidget) {
    (window as any).Calendly.initPopupWidget({ url });
    return true;
  }
  return false;
}

let scriptPromise: Promise<boolean> | null = null;

function loadCalendlyScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if ((window as any).Calendly?.initPopupWidget) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    // CSS (no need to wait)
    if (!document.querySelector(`link[href="${CALENDLY_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = CALENDLY_CSS;
      document.head.appendChild(link);
    }
    // Script
    const existing = document.querySelector(`script[src="${CALENDLY_SCRIPT}"]`) as HTMLScriptElement | null;
    if (existing) {
      // Already loading; wait for the global to appear.
      const check = () => {
        if ((window as any).Calendly?.initPopupWidget) resolve(true);
        else setTimeout(check, 50);
      };
      check();
      return;
    }
    const s = document.createElement('script');
    s.src = CALENDLY_SCRIPT;
    s.async = true;
    s.onload = () => resolve(Boolean((window as any).Calendly?.initPopupWidget));
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
  return scriptPromise;
}

interface Props {
  url: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackLabel?: string;
}

export default function BookingButton({
  url,
  label = 'Book now',
  className,
  style,
  fallbackLabel,
}: Props) {
  const isCalendly = isCalendlyUrl(url);
  const preloadedRef = useRef(false);

  // Pre-warm Calendly's script on hover so the popup opens instantly.
  const handlePointerEnter = useCallback(() => {
    if (isCalendly && !preloadedRef.current) {
      preloadedRef.current = true;
      loadCalendlyScript().catch(() => {});
    }
  }, [isCalendly]);

  // For non-Calendly URLs, render a plain external link.
  if (!isCalendly) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
      >
        {label}
      </a>
    );
  }

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const loaded = await loadCalendlyScript();
    if (loaded && (window as any).Calendly?.initPopupWidget) {
      (window as any).Calendly.initPopupWidget({ url });
    } else {
      // Graceful fallback — open in a new tab if the widget couldn't load.
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <a
      href={url}
      onClick={onClick}
      onMouseEnter={handlePointerEnter}
      onFocus={handlePointerEnter}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      aria-label={fallbackLabel || label}
    >
      {label}
    </a>
  );
}

/**
 * Inline embed variant — drops Calendly directly into the page instead of a
 * popup. Use sparingly; popup is the better default. Renders a plain message
 * if `url` is not a Calendly URL (inline only works for Calendly).
 */
export function BookingInline({ url, height = 700 }: { url: string; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !isCalendlyUrl(url)) return;
    loadCalendlyScript().then((loaded) => {
      if (!loaded || !ref.current) return;
      (window as any).Calendly.initInlineWidget({
        url,
        parentElement: ref.current,
      });
    });
  }, [url]);

  if (!isCalendlyUrl(url)) {
    return (
      <p style={{ padding: '1rem', background: '#f5f0e8', color: '#6e6a62', fontFamily: 'Lora, serif', fontSize: '0.9rem' }}>
        Booking link not yet configured.
      </p>
    );
  }

  return <div ref={ref} style={{ minWidth: 320, height }} />;
}

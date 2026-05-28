'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { activatePixelIfConsented, getConsent } from '@/lib/analytics';

interface AnalyticsProps {
  /** GA4 measurement ID (G-XXXXXXX). If blank, GA4 is not loaded at all. */
  gaId?: string;
  /** Meta Pixel ID. If blank, the pixel is not loaded. */
  fbPixelId?: string;
}

/**
 * Loads GA4 + Meta Pixel under Google Consent Mode v2.
 *
 *  - GA4 loads immediately with consent = denied for everything. Once the
 *    visitor accepts the cookie banner, lib/analytics.ts → setConsent
 *    bumps it to granted and Google sends the queued pings.
 *  - Meta Pixel only loads AFTER consent — Meta has no equivalent queue.
 *  - Page views auto-fire on every client-side navigation via the pathname
 *    + searchParams effect below.
 *
 * Component-level guard:
 *  - If gaId is empty, no GA script is injected at all (no useless requests
 *    to googletagmanager.com).
 */
export default function Analytics({ gaId, fbPixelId }: AnalyticsProps) {
  const pathname = usePathname();

  // Fire a page_view on every route change once GA is loaded.
  // We deliberately don't watch searchParams: GA4 captures the full URL +
  // UTM tags from window.location automatically, and useSearchParams forces
  // a Suspense boundary that would deopt the whole tree from static.
  useEffect(() => {
    if (!gaId) return;
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
    });
    if (window.fbq) {
      try { window.fbq('track', 'PageView'); } catch { /* noop */ }
    }
  }, [pathname, gaId]);

  // If consent was previously granted (returning visitor), activate the pixel
  // and bump GA to granted state.
  useEffect(() => {
    if (getConsent() === 'granted') {
      if (window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          analytics_storage: 'granted',
        });
      }
      if (fbPixelId) activatePixelIfConsented(fbPixelId);
    }
    // Listen for first-time consent grants from the CookieBanner.
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.state === 'granted' && fbPixelId) activatePixelIfConsented(fbPixelId);
    };
    window.addEventListener('alw-consent-changed', onConsent);
    return () => window.removeEventListener('alw-consent-changed', onConsent);
  }, [fbPixelId]);

  if (!gaId) return null;

  return (
    <>
      {/* GA4 — loaded with Consent Mode v2 in denied state by default. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('consent', 'default', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
          wait_for_update: 500
        });
        gtag('js', new Date());
        gtag('config', '${gaId}', { send_page_view: false });
      `}</Script>
    </>
  );
}

/**
 * MobilePreviewClose — floating X button on mobile preview screens.
 *
 * Anna's 24 Jun feedback:
 *   "When you go to open the Preview, you can't then close it on a
 *    mobile as there no x button to close."
 *
 * Strapi v5's preview iframe overlay ships without a mobile-friendly
 * close affordance — the standard close button is either hidden or
 * cropped off-screen on narrow viewports. This component watches for
 * preview URLs (any path containing /preview) and renders a fixed
 * top-right × button on mobile (≤ 768px) that calls history.back().
 *
 * Mounted from app.tsx into a portal div on document.body (same
 * pattern as HelpFab) so it survives Strapi SPA route changes.
 */

import { useEffect, useState } from 'react';

const styles: Record<string, React.CSSProperties> = {
  close: {
    position: 'fixed',
    top: 12,
    right: 12,
    zIndex: 100000,
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'rgba(35, 31, 32, 0.85)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    fontSize: 22,
    fontWeight: 300,
    lineHeight: 1,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
    fontFamily: 'system-ui, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  },
};

export default function MobilePreviewClose() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return;
      const isMobile = window.innerWidth <= 768;
      const isPreview =
        window.location.pathname.includes('/preview') ||
        window.location.search.includes('preview=') ||
        // Strapi v5 sometimes wraps preview in an iframe — detect by presence
        // of any iframe whose src points to staging/site URL.
        !!document.querySelector('iframe[src*="staging.annalouwellness.com"], iframe[src*="annalouwellness.com"]');
      setShow(isMobile && isPreview);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('popstate', check);
    // Patch pushState so SPA route changes trigger the check.
    const origPush = window.history.pushState;
    window.history.pushState = function (...args) {
      const r = origPush.apply(this, args as any);
      check();
      return r;
    };
    // Also re-check periodically because iframes can mount async.
    const interval = window.setInterval(check, 1500);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('popstate', check);
      window.history.pushState = origPush;
      window.clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      style={styles.close}
      onClick={() => {
        if (window.history.length > 1) window.history.back();
        else window.location.href = '/admin';
      }}
      aria-label="Close preview"
      title="Close preview"
    >
      ×
    </button>
  );
}

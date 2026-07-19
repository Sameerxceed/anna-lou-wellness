'use client';

import { useEffect, useState } from 'react';

/**
 * Detects whether the page is rendered inside an iframe (e.g. the Strapi
 * CMS preview mode). Anna's July 2026 feedback: pay buttons + forms don't
 * work in the CMS preview because Stripe.js and Cloudflare Turnstile both
 * refuse to run inside cross-origin iframes for security reasons.
 *
 * Rather than trying to make them work (impossible), we detect the iframe
 * and swap interactive elements for a friendly "Preview mode — click 'Open
 * live' to test this" note. Live site behaviour is unchanged.
 */
export function useInIframe(): boolean {
  const [inIframe, setInIframe] = useState(false);
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.self !== window.top) {
        setInIframe(true);
      }
    } catch {
      // Cross-origin access to window.top throws — we're definitely in an iframe.
      setInIframe(true);
    }
  }, []);
  return inIframe;
}

'use client';

import { useInIframe } from '@/lib/useInIframe';

interface Props {
  /** Optional custom label — defaults to a generic preview-mode message. */
  action?: string;
}

/**
 * Small inline notice shown INSTEAD of interactive elements (Stripe pay
 * buttons, Turnstile-gated forms) when the page is rendered inside the
 * Strapi CMS preview iframe. Renders nothing on the live site.
 *
 * Pattern:
 *   const inIframe = useInIframe();
 *   if (inIframe) return <PreviewModeNotice action="Payment" />;
 *   return <StripeButton ... />
 */
export default function PreviewModeNotice({ action = 'This action' }: Props) {
  const inIframe = useInIframe();
  if (!inIframe) return null;
  return (
    <div
      style={{
        background: '#FFF6E5',
        border: '1px solid #EEDFB4',
        borderRadius: 8,
        padding: '0.9rem 1.1rem',
        fontFamily: 'EB Garamond, Georgia, serif',
        fontSize: '0.95rem',
        color: '#5D5A52',
        lineHeight: 1.55,
        margin: '1rem 0',
      }}
    >
      <strong style={{ color: '#8A6D3B' }}>Preview mode:</strong> {action} is
      disabled inside the CMS preview because Stripe and CAPTCHA don&apos;t
      work in iframes. Click <strong>Open live</strong> (top right in Strapi)
      to test the real button — it works on the live site.
    </div>
  );
}

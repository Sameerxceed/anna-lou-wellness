'use client';

import { useEffect, useRef } from 'react';
import { trackPurchase } from '@/lib/analytics';

interface Props {
  transactionId: string;
  value: number;
  currency?: string;
  items?: Array<{ id: string | number; name: string; price: number; qty: number; category?: string }>;
}

/**
 * Fires the GA4 `purchase` event + Meta Pixel `Purchase` event exactly once
 * per mount. Used on /thank-you after a Stripe redirect, where the
 * client-side state was lost during the round-trip to Stripe.
 *
 * Dedupe: the transactionId is stored in sessionStorage so a refresh of the
 * thank-you page (or the user backing into it) doesn't double-count revenue
 * in analytics. Stripe's own dashboard is the source of truth either way.
 */
export default function PurchaseTracker({ transactionId, value, currency = 'GBP', items }: Props) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (!transactionId) return;
    if (typeof window === 'undefined') return;

    const key = 'alw-purchase-fired';
    const already = sessionStorage.getItem(key);
    if (already === transactionId) return;

    trackPurchase({ transactionId, value, currency, items });
    sessionStorage.setItem(key, transactionId);
    firedRef.current = true;
  }, [transactionId, value, currency, items]);

  return null;
}

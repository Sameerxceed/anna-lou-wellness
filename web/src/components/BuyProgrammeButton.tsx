'use client';

import { useState } from 'react';

/**
 * BuyProgrammeButton — Stripe Checkout for any programme that has a price.
 *
 * POSTs to /api/stripe/checkout with `strapi_type: 'programme'` + the programme
 * slug. The /api/stripe/checkout route re-fetches the programme record from
 * Strapi at request time, so price / Mailchimp tag / role grant always come
 * from the current CMS values (no stored Stripe price IDs anywhere).
 *
 * Currently used for REGULATED on /the-work/regulated (pay-what-you-feel,
 * £5 minimum). Other programmes still use the /contact discovery-call flow.
 */

interface Props {
  slug: string;
  label?: string;
  className?: string;
  /** Override background colour. Defaults to plum. */
  background?: string;
  /** Optional email to pre-fill on Stripe Checkout. */
  email?: string;
}

export default function BuyProgrammeButton({
  slug,
  label = 'Buy now',
  className,
  background,
  email,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strapi_type: 'programme', strapi_id: slug, email }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        setError(data?.error || 'Could not start checkout. Please try again.');
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={className}
        style={{
          ...(background ? { background, borderColor: background } : undefined),
          ...(loading ? { opacity: 0.6, cursor: 'wait' } : undefined),
        }}
      >
        {loading ? 'Opening checkout…' : label}{!loading && ' →'}
      </button>
      {error && (
        <p style={{
          marginTop: 8,
          fontSize: '0.8rem',
          color: '#B12B2B',
          fontFamily: 'Mulish, sans-serif',
        }}>{error}</p>
      )}
    </>
  );
}

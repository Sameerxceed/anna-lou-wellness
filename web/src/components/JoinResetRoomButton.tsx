'use client';

import { useState } from 'react';

/**
 * JoinResetRoomButton — single-purpose CTA that kicks off Stripe Checkout
 * for the Reset Room monthly subscription.
 *
 * POSTs to /api/stripe/checkout with `strapi_type: 'membership'` — the
 * Membership singleton in Strapi drives the price, currency, recurring
 * cadence, Mailchimp tag, and the reset-room-member role grant. On
 * success, Stripe redirects the user to /community/reset-room/dashboard.
 *
 * Pass `label` to customise the button text (defaults to "Join the Reset
 * Room"). `className` overrides the wrapping element's CSS class so the
 * button inherits whatever page style applies.
 */

interface Props {
  label?: string;
  className?: string;
  /** Optional email to pre-fill on Stripe Checkout. */
  email?: string;
}

export default function JoinResetRoomButton({
  label = 'Join the Reset Room',
  className,
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
        body: JSON.stringify({ strapi_type: 'membership', email }),
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
        style={loading ? { opacity: 0.6, cursor: 'wait' } : undefined}
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

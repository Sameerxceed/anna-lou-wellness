'use client';

import { useState } from 'react';
import { useInIframe } from '@/lib/useInIframe';
import PreviewModeNotice from './PreviewModeNotice';

interface Props {
  slug: string;
  /** All allowed amounts in pence, sorted ascending in the dropdown. */
  optionsPence: number[];
  /** Which option is pre-selected. Falls back to the smallest option. */
  defaultPence?: number | null;
  /** Text above the dropdown, from the CMS. */
  label?: string | null;
  /** Text on the Pay button. */
  buttonLabel?: string;
  /** Background colour override for the Pay button. Defaults to plum. */
  background?: string;
}

/**
 * Pay-what-you-can block for REGULATED (and any other programme Anna flags
 * with pwycOptions). Renders a dropdown of allowed amounts + a Pay button
 * that opens Stripe Checkout at the chosen amount.
 *
 * Server-side enforces the amount is one of the allowed values so the
 * client can't submit an arbitrary price.
 */
export default function PwycBuyBlock({
  slug,
  optionsPence,
  defaultPence,
  label,
  buttonLabel = 'Pay',
  background = '#6E3A5A',
}: Props) {
  const sorted = [...optionsPence].sort((a, b) => a - b);
  const initial =
    defaultPence && sorted.includes(defaultPence) ? defaultPence : sorted[0];
  const [amountPence, setAmountPence] = useState<number>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inIframe = useInIframe();

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strapi_type: 'programme', strapi_id: slug, amountPence }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Could not start checkout.');
      }
      window.location.href = data.url;
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: '#F5F0E8',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 10,
        padding: '1.6rem 1.4rem',
        maxWidth: 460,
        margin: '2rem auto',
        textAlign: 'center',
        fontFamily: 'EB Garamond, Georgia, serif',
      }}
    >
      {label && (
        <p
          style={{
            fontFamily: 'Mulish, sans-serif',
            fontWeight: 500,
            fontSize: '0.6rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#6E3A5A',
            margin: '0 0 0.7rem',
          }}
        >
          {label}
        </p>
      )}

      <select
        value={amountPence}
        onChange={(e) => setAmountPence(Number(e.target.value))}
        disabled={loading}
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: '1.1rem',
          padding: '0.7rem 1rem',
          background: '#fff',
          border: '1px solid #cfc7ba',
          borderRadius: 4,
          minWidth: 200,
          marginBottom: '1rem',
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {sorted.map((cents) => (
          <option key={cents} value={cents}>
            £{(cents / 100).toFixed(0)}
          </option>
        ))}
      </select>

      {inIframe ? (
        <PreviewModeNotice action="Payment" />
      ) : (
        <>
          <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.95rem 1rem',
              background: loading ? '#8E5A75' : background,
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Opening checkout…' : `${buttonLabel} £${(amountPence / 100).toFixed(0)}`}
          </button>
          {error && (
            <p style={{ marginTop: '0.7rem', fontSize: '0.85rem', color: '#B33A3A' }}>{error}</p>
          )}
        </>
      )}
    </div>
  );
}

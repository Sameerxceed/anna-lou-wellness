'use client';

import { useState } from 'react';
import type { DiscoveryCallBlock as DiscoveryCallBlockData } from '@/lib/cms';
import { useInIframe } from '@/lib/useInIframe';
import PreviewModeNotice from './PreviewModeNotice';

interface Props {
  data: DiscoveryCallBlockData;
}

/**
 * Discovery Call £10 refundable booking block.
 *
 * Anna 10 Jul: "Book my call goes straight to Stripe Checkout, £10,
 * product name Discovery call booking, not to Calendly first. Payment
 * then calendar, because that is the order that makes the tenner work."
 *
 * All content lives on the Contact singleton in the CMS. The block hides
 * itself if either the Calendly URL or the headline is blank.
 */
export default function DiscoveryCallBlock({ data }: Props) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inIframe = useInIframe();

  const handleBook = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout/discovery-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.url) {
        throw new Error(json?.error || 'Could not start checkout.');
      }
      window.location.href = json.url;
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const paragraphs = (data.whyPriceBody || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      className="reveal"
      style={{
        background: '#F6EAF0',
        border: '1px solid #E5C9D6',
        borderRadius: 12,
        padding: '2.4rem 1.8rem',
        maxWidth: 620,
        margin: '2.5rem auto',
        textAlign: 'center',
        fontFamily: 'EB Garamond, Georgia, serif',
      }}
    >
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
          fontWeight: 500,
          fontSize: '2rem',
          margin: '0 0 0.9rem',
          color: '#231F20',
        }}
      >
        {data.headline}
      </h2>

      {data.intro && (
        <p
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.55,
            color: '#4a3d40',
            margin: '0 auto 1.5rem',
            maxWidth: 480,
          }}
        >
          {data.intro}
        </p>
      )}

      {inIframe ? (
        <PreviewModeNotice action="Booking + payment" />
      ) : (
        <button
          type="button"
          onClick={handleBook}
          disabled={loading}
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontWeight: 400,
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#fff',
            background: loading ? '#8E5A75' : '#6E3A5A',
            border: 'none',
            padding: '0.95rem 2.2rem',
            cursor: loading ? 'wait' : 'pointer',
            transition: 'background 0.2s',
            minWidth: 220,
          }}
        >
          {loading ? 'Loading…' : data.buttonLabel}
        </button>
      )}

      {error && (
        <p
          style={{
            marginTop: '0.8rem',
            fontSize: '0.85rem',
            color: '#B33A3A',
          }}
        >
          {error}
        </p>
      )}

      {data.whyPriceLabel && paragraphs.length > 0 && (
        <div style={{ marginTop: '1.4rem' }}>
          <button
            type="button"
            onClick={() => setExpanded((x) => !x)}
            aria-expanded={expanded}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6E3A5A',
              fontFamily: 'EB Garamond, Georgia, serif',
              fontSize: '0.95rem',
              fontStyle: 'italic',
              textDecoration: 'underline',
              textDecorationColor: '#E5C9D6',
              textUnderlineOffset: 3,
              padding: 0,
            }}
          >
            {expanded ? `Hide "${data.whyPriceLabel.replace(/\?$/, '')}"` : data.whyPriceLabel}
          </button>

          {expanded && (
            <div
              style={{
                marginTop: '1rem',
                textAlign: 'left',
                background: '#FCFBF8',
                border: '1px solid #E5C9D6',
                borderRadius: 8,
                padding: '1.2rem 1.4rem',
                fontSize: '0.98rem',
                lineHeight: 1.65,
                color: '#3a2e32',
              }}
            >
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  style={{ margin: i === 0 ? '0 0 0.9rem' : '0.9rem 0 0' }}
                >
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

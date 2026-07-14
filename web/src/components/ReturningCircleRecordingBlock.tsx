'use client';

import { useState } from 'react';

interface Props {
  headline: string;
  intro?: string;
  buttonLabel: string;
  priceGbp: number;
  weekLabel?: string;
  helpNote?: string;
}

const ACCENT = '#5DCAA5';

/**
 * Returning Circle recording — one-off GBP 10 purchase.
 *
 * Auto-hides if `headline` is blank OR (upstream) if the YouTube URL is
 * blank in the CMS — the API returns a 503 in that case so users never
 * pay for a recording that doesn't exist yet. But we also gate the block
 * on `headline` so Anna can hide the entire section by clearing that one
 * field.
 */
export default function ReturningCircleRecordingBlock({
  headline,
  intro,
  buttonLabel,
  priceGbp,
  weekLabel,
  helpNote,
}: Props) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please add your email so we can send you the recording.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout/returning-circle-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), firstName: firstName.trim() }),
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

  if (!headline) return null;

  const priceLabel = `£${priceGbp}`;

  return (
    <section
      className="rc-recording-block"
      style={{
        background: '#F1FAF5',
        border: `1px solid ${ACCENT}40`,
        borderRadius: 12,
        padding: '2.4rem 1.8rem',
        maxWidth: 620,
        margin: '2.5rem auto',
        textAlign: 'center',
        fontFamily: 'EB Garamond, Georgia, serif',
      }}
    >
      <p
        style={{
          fontFamily: 'Mulish, sans-serif',
          fontWeight: 500,
          fontSize: '0.6rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: ACCENT,
          margin: '0 0 0.6rem',
        }}
      >
        Watch it back {weekLabel ? ` — ${weekLabel}` : ''}
      </p>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
          fontWeight: 500,
          fontSize: '1.9rem',
          margin: '0 0 0.9rem',
          color: '#231F20',
          lineHeight: 1.2,
        }}
      >
        {headline}
      </h2>

      {intro && (
        <p
          style={{
            fontSize: '1.02rem',
            lineHeight: 1.55,
            color: '#3a4a42',
            margin: '0 auto 1.4rem',
            maxWidth: 500,
          }}
        >
          {intro}
        </p>
      )}

      <form
        onSubmit={handleBuy}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.7rem',
          maxWidth: 400,
          margin: '0 auto',
        }}
      >
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name (optional)"
          autoComplete="given-name"
          style={{
            padding: '0.75rem 0.9rem',
            fontFamily: 'EB Garamond, Georgia, serif',
            fontSize: '1rem',
            border: '1px solid #cfd8d3',
            borderRadius: 4,
            background: '#fff',
          }}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email — the recording goes here"
          autoComplete="email"
          required
          style={{
            padding: '0.75rem 0.9rem',
            fontFamily: 'EB Garamond, Georgia, serif',
            fontSize: '1rem',
            border: '1px solid #cfd8d3',
            borderRadius: 4,
            background: '#fff',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontWeight: 400,
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#fff',
            background: loading ? '#7fc4a4' : ACCENT,
            border: 'none',
            padding: '0.95rem 1.4rem',
            cursor: loading ? 'wait' : 'pointer',
            transition: 'background 0.2s',
            marginTop: '0.2rem',
          }}
        >
          {loading ? 'Loading…' : `${buttonLabel} — ${priceLabel}`}
        </button>
      </form>

      {error && (
        <p
          style={{
            marginTop: '0.8rem',
            fontSize: '0.9rem',
            color: '#B33A3A',
          }}
        >
          {error}
        </p>
      )}

      {helpNote && (
        <p
          style={{
            marginTop: '1.1rem',
            fontSize: '0.88rem',
            color: '#5d6a63',
            fontStyle: 'italic',
            lineHeight: 1.5,
            maxWidth: 460,
            margin: '1.1rem auto 0',
          }}
        >
          {helpNote}
        </p>
      )}
    </section>
  );
}

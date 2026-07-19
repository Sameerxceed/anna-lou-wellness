'use client';

import { useEffect, useState } from 'react';
import { useInIframe } from '@/lib/useInIframe';
import PreviewModeNotice from './PreviewModeNotice';

interface RecordingInfo {
  id: number;
  title: string;
  session_date: string;
  price_gbp: number;
  description?: string | null;
}

interface Props {
  /** Optional CMS-driven copy overrides from the Community Event singleton. */
  headline?: string;
  intro?: string;
  buttonLabel?: string;
  helpNote?: string;
}

const ACCENT = '#5DCAA5';

/**
 * Returning Circle recording — one-off purchase.
 *
 * The Recording collection is the source of truth. This component asks
 * /api/checkout/returning-circle-recording/current for whichever recording
 * is currently marked is_available_for_purchase, so Anna can put a
 * different price on a guest facilitator week without touching code.
 *
 * The whole block hides if there's no purchasable recording — Anna
 * simply unticks is_available_for_purchase on every entry to hide the
 * Buy option between weeks.
 */
export default function ReturningCircleRecordingBlock({
  headline,
  intro,
  buttonLabel,
  helpNote,
}: Props) {
  const [current, setCurrent] = useState<RecordingInfo | null | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inIframe = useInIframe();

  useEffect(() => {
    let cancelled = false;
    fetch('/api/recordings/current', { cache: 'no-store' })
      .then((r) => r.json().catch(() => ({})))
      .then((json) => {
        if (cancelled) return;
        const rec = json?.recording;
        setCurrent(rec ? (rec as RecordingInfo) : null);
      })
      .catch(() => {
        if (!cancelled) setCurrent(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  // Loading — render nothing so the page doesn't flash empty state
  if (current === undefined) return null;

  // Nothing on sale right now — hide the entire block
  if (current === null) return null;

  const finalHeadline = headline || `Missed the Circle? Watch it back.`;
  const finalIntro =
    intro ||
    'One-off payment. Unlisted YouTube link sent to your inbox and saved in your library. Available for 7 days.';
  const finalButton = buttonLabel || "Buy this week's recording";
  const dateLabel = current.session_date
    ? new Date(current.session_date).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : '';
  const priceLabel = `£${current.price_gbp}`;

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
        Watch it back{dateLabel ? ` — ${dateLabel}` : ''}
      </p>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
          fontWeight: 500,
          fontSize: '1.9rem',
          margin: '0 0 0.5rem',
          color: '#231F20',
          lineHeight: 1.2,
        }}
      >
        {finalHeadline}
      </h2>
      <p
        style={{
          fontSize: '1rem',
          color: '#5d6a63',
          margin: '0 0 1rem',
          fontStyle: 'italic',
        }}
      >
        {current.title}
      </p>

      {finalIntro && (
        <p
          style={{
            fontSize: '1.02rem',
            lineHeight: 1.55,
            color: '#3a4a42',
            margin: '0 auto 1.4rem',
            maxWidth: 500,
          }}
        >
          {finalIntro}
        </p>
      )}

      {inIframe && <PreviewModeNotice action="Buying the recording" />}

      <form
        onSubmit={handleBuy}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.7rem',
          maxWidth: 400,
          margin: '0 auto',
          opacity: inIframe ? 0.5 : 1,
          pointerEvents: inIframe ? 'none' : 'auto',
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
          {loading ? 'Loading…' : `${finalButton} — ${priceLabel}`}
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

      <p
        style={{
          marginTop: '1.4rem',
          fontSize: '0.9rem',
          color: '#5d6a63',
          margin: '1.4rem 0 0',
        }}
      >
        Already bought a recording?{' '}
        <a
          href="/login?next=/community/reset-room/dashboard"
          style={{
            color: '#6E3A5A',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
            fontWeight: 500,
          }}
        >
          Log in to your library →
        </a>
      </p>

      {helpNote && (
        <p
          style={{
            marginTop: '0.8rem',
            fontSize: '0.85rem',
            color: '#5d6a63',
            fontStyle: 'italic',
            lineHeight: 1.5,
            maxWidth: 460,
            margin: '0.8rem auto 0',
          }}
        >
          {helpNote}
        </p>
      )}
    </section>
  );
}

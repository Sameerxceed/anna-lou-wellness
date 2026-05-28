'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import TurnstileWidget from '@/components/TurnstileWidget';
import { trackEvent } from '@/lib/analytics';

export default function DecoderForm({
  buttonLabel,
  microcopy,
  successTitle,
  successBody,
  formTitle,
}: {
  buttonLabel: string;
  microcopy: string;
  successTitle: string;
  successBody: string;
  formTitle: string;
}) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/lead/decoder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, email, turnstileToken, source: 'decoder-landing' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      trackEvent('generate_lead', { method: 'decoder', source: 'decoder-landing', value: 0, currency: 'GBP' }, 'Lead');
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  if (done) {
    const paras = successBody.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    return (
      <div className="dec-success">
        <p className="dec-section-label">Check your inbox</p>
        <h3 className="dec-success-title">{successTitle}</h3>
        {paras.map((p, i) => <p key={i} className="dec-body-text">{p}</p>)}
        <div className="dec-cta-row">
          <Link href="/the-work/quiz" className="dec-cta-link">Take the 5-minute coaching quiz &rarr;</Link>
          <Link href="/community/reset-room" className="dec-cta-link">Step into The Reset Room &rarr;</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="dec-form" onSubmit={onSubmit}>
      <p className="dec-section-label">{formTitle}</p>
      <label className="dec-label">
        <span>First name</span>
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
      </label>
      <label className="dec-label">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </label>
      <div style={{ margin: '0.6rem 0' }}>
        <TurnstileWidget onVerify={setTurnstileToken} theme="dark" size="flexible" />
      </div>
      <button type="submit" disabled={submitting} className="dec-submit">
        {submitting ? 'Sending...' : buttonLabel}
      </button>
      {error && <p className="dec-fineprint" style={{ color: '#F280AA' }}>{error}</p>}
      <p className="dec-fineprint">{microcopy}</p>
    </form>
  );
}

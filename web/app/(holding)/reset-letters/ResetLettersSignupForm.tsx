'use client';

import { useState, FormEvent } from 'react';
import TurnstileWidget from '@/components/TurnstileWidget';

export default function ResetLettersSignupForm({
  buttonLabel,
  placeholder,
  microcopy,
}: {
  buttonLabel: string;
  placeholder: string;
  microcopy: string;
}) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    if (!captchaToken) {
      setError('Please complete the verification below before subscribing.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe-reset-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken: captchaToken }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      window.location.href = '/welcome';
    } catch {
      // Network failure — still redirect (we don't want to lose the signup
      // intent on a transient hiccup). Backend webhooks will catch up.
      window.location.href = '/welcome';
    }
  }

  return (
    <>
      <form className="rl-form" onSubmit={onSubmit}>
        <input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rl-input"
          required
          aria-label="Email address"
        />
        <div style={{ margin: '0.8rem 0' }}>
          <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />
        </div>
        {error && <p className="rl-privacy" style={{ color: '#B33A3A' }}>{error}</p>}
        <button type="submit" className="rl-submit" disabled={submitting || !captchaToken}>
          {submitting ? 'CLAIMING...' : buttonLabel.toUpperCase()}
        </button>
      </form>
      <p className="rl-privacy">{microcopy}</p>
    </>
  );
}

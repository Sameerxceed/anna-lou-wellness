'use client';

import { useState, FormEvent } from 'react';

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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe-reset-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      void res;
      window.location.href = '/welcome';
    } catch {
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
        <button type="submit" className="rl-submit" disabled={submitting}>
          {submitting ? 'CLAIMING...' : buttonLabel.toUpperCase()}
        </button>
      </form>
      <p className="rl-privacy">{microcopy}</p>
    </>
  );
}

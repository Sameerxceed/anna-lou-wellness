'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetForm({ code, isWelcome }: { code: string; isWelcome: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password, passwordConfirmation: confirm }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Could not set your password. The link may have expired — request a fresh one from the sign-in page.');
      }
      // Auto-redirect to /account after a brief beat so the cookie is set.
      router.push(isWelcome ? '/account?welcome=1' : '/account');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .rf-form { display: flex; flex-direction: column; gap: 0.9rem; }
        .rf-label { font-family: Mulish, sans-serif; font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; color: #8C8880; margin-bottom: 0.3rem; display: block; }
        .rf-input { width: 100%; padding: 0.7rem 0.8rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; background: #fff; color: #231F20; }
        .rf-input:focus { outline: none; border-color: #6E3A5A; }
        .rf-error { background: #FDE8E8; color: #B33A3A; padding: 0.6rem 0.8rem; border-radius: 4px; font-family: 'EB Garamond', Georgia, serif; font-size: 0.88rem; }
        .rf-submit { background: #231F20; color: #F5F3EF; border: none; padding: 0.9rem 1.2rem; border-radius: 4px; font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; margin-top: 0.4rem; transition: background 0.2s; }
        .rf-submit:hover:not(:disabled) { background: #6E3A5A; }
        .rf-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
      <form className="rf-form" onSubmit={onSubmit}>
        <div>
          <label className="rf-label" htmlFor="rf-pw">New password</label>
          <input
            id="rf-pw"
            type="password"
            className="rf-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>
        <div>
          <label className="rf-label" htmlFor="rf-pw2">Confirm password</label>
          <input
            id="rf-pw2"
            type="password"
            className="rf-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>
        {error && <div className="rf-error">{error}</div>}
        <button type="submit" className="rf-submit" disabled={loading}>
          {loading ? 'Saving…' : isWelcome ? 'Finish setup' : 'Set password'}
        </button>
      </form>
    </>
  );
}

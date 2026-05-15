'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm({ nextUrl }: { nextUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || 'Sign in failed');
        }
        router.push(nextUrl);
        router.refresh();
      } else {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || 'Could not send reset email');
        }
        router.push('/login?reset=1');
      }
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
        .lf-form { display: flex; flex-direction: column; gap: 0.8rem; }
        .lf-label { font-family: Mulish, sans-serif; font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; color: #8C8880; margin-bottom: 0.3rem; display: block; }
        .lf-input { width: 100%; padding: 0.7rem 0.8rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; background: #fff; color: #231F20; }
        .lf-input:focus { outline: none; border-color: #6E3A5A; }
        .lf-error { background: #FDE8E8; color: #B33A3A; padding: 0.6rem 0.8rem; border-radius: 4px; font-family: 'EB Garamond', Georgia, serif; font-size: 0.88rem; }
        .lf-submit { background: #231F20; color: #F5F3EF; border: none; padding: 0.8rem 1.2rem; border-radius: 4px; font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; margin-top: 0.4rem; transition: background 0.2s; }
        .lf-submit:hover:not(:disabled) { background: #6E3A5A; }
        .lf-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .lf-mode-link { font-family: 'EB Garamond', Georgia, serif; font-size: 0.85rem; color: #6E3A5A; text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0; margin-top: 0.4rem; text-align: center; }
      `}</style>
      <form className="lf-form" onSubmit={onSubmit}>
        <div>
          <label className="lf-label" htmlFor="lf-email">Email</label>
          <input
            id="lf-email"
            type="email"
            className="lf-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        {mode === 'login' && (
          <div>
            <label className="lf-label" htmlFor="lf-password">Password</label>
            <input
              id="lf-password"
              type="password"
              className="lf-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
        )}

        {error && <div className="lf-error">{error}</div>}

        <button type="submit" className="lf-submit" disabled={loading}>
          {loading
            ? mode === 'login' ? 'Signing in…' : 'Sending…'
            : mode === 'login' ? 'Sign in' : 'Send reset link'}
        </button>

        <button
          type="button"
          className="lf-mode-link"
          onClick={() => { setError(''); setMode(mode === 'login' ? 'forgot' : 'login'); }}
        >
          {mode === 'login' ? 'Forgot your password?' : '← Back to sign in'}
        </button>
      </form>
    </>
  );
}

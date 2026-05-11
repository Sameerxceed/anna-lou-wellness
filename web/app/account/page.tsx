'use client';

import { useState } from 'react';
import Link from 'next/link';

type Mode = 'login' | 'register' | 'forgot';

export default function AccountPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    // Placeholder: real auth wiring (Strapi users-permissions) to be connected when accounts go live.
    setTimeout(() => {
      setSubmitting(false);
      if (mode === 'forgot') {
        setMessage('If an account exists for that email, a reset link has been sent.');
      } else {
        setMessage('Accounts are not yet open. Join Reset Letters to be notified when they launch.');
      }
    }, 800);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: accountStyles }} />
      <section className="account-page">
        <div className="account-inner">
          <p className="account-kicker">{mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Welcome Back'}</p>
          <h1 className="account-title">
            {mode === 'login' && <>Come back in.</>}
            {mode === 'register' && <>Create your space.</>}
            {mode === 'forgot' && <>Let&apos;s find your way back.</>}
          </h1>
          <p className="account-sub">
            {mode === 'login' && 'Sign in to access your orders, saved pieces, and Reset Room.'}
            {mode === 'register' && 'One account for the shop, the Reset Room, and everything we send.'}
            {mode === 'forgot' && 'Enter your email and we will send a reset link.'}
          </p>

          <form className="account-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="account-label">
                <span>Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </label>
            )}
            <label className="account-label">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            {mode !== 'forgot' && (
              <label className="account-label">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
              </label>
            )}

            <button type="submit" className="account-submit" disabled={submitting}>
              {submitting
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                ? 'Create Account'
                : 'Send Reset Link'}
            </button>

            {message && <p className="account-message">{message}</p>}
          </form>

          <div className="account-switch">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => { setMode('forgot'); setMessage(null); }}>Forgot password?</button>
                <span>·</span>
                <button type="button" onClick={() => { setMode('register'); setMessage(null); }}>Create account</button>
              </>
            )}
            {mode === 'register' && (
              <button type="button" onClick={() => { setMode('login'); setMessage(null); }}>Already have an account? Sign in</button>
            )}
            {mode === 'forgot' && (
              <button type="button" onClick={() => { setMode('login'); setMessage(null); }}>Back to sign in</button>
            )}
          </div>

          <div className="account-substack">
            <p className="account-substack-kicker">Reset Letters</p>
            <p>Not ready for an account? Join Reset Letters — Anna&apos;s Substack — for free.</p>
            <Link href="/reset-letters" className="account-substack-cta">Join Reset Letters &rarr;</Link>
          </div>
        </div>
      </section>
    </>
  );
}

const accountStyles = `
.account-page { background:#F5F3EF; padding:3rem 2rem 4rem; min-height:70vh; }
.account-inner { max-width:440px; margin:0 auto; }
.account-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.22em; text-transform:uppercase; color:#6E3A5A; margin-bottom:0.6rem; text-align:center; }
.account-title { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-weight:400; font-size:clamp(2rem,5vw,2.8rem); line-height:1.2; color:#231F20; text-align:center; margin-bottom:0.8rem; }
.account-sub { font-family:'EB Garamond',Georgia,serif; font-size:1rem; line-height:1.7; color:#3D3D3A; text-align:center; margin-bottom:2rem; }

.account-form { background:#fff; padding:2rem; border-radius:6px; border:1px solid rgba(0,0,0,0.06); }
.account-label { display:block; margin-bottom:1.1rem; }
.account-label span { display:block; font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.15em; text-transform:uppercase; color:#3D3D3A; margin-bottom:0.4rem; }
.account-label input {
  width:100%;
  height:46px;
  padding:0 0.9rem;
  border:1px solid rgba(0,0,0,0.12);
  border-radius:4px;
  font-family:'EB Garamond',Georgia,serif;
  font-size:0.95rem;
  color:#231F20;
  background:#fff;
  outline:none;
  transition:border-color 0.2s;
}
.account-label input:focus { border-color:#6E3A5A; }

.account-submit {
  width:100%;
  height:48px;
  margin-top:0.6rem;
  background:#6E3A5A;
  color:#fff;
  border:none;
  border-radius:4px;
  font-family:Mulish,sans-serif;
  font-weight:500;
  font-size:0.65rem;
  letter-spacing:0.2em;
  text-transform:uppercase;
  cursor:pointer;
  transition:background 0.2s;
}
.account-submit:hover { background:#5A2E4A; }
.account-submit:disabled { opacity:0.6; cursor:not-allowed; }

.account-message {
  margin-top:1rem;
  font-family:'EB Garamond',Georgia,serif;
  font-style:italic;
  font-size:0.9rem;
  color:#3D3D3A;
  text-align:center;
  line-height:1.6;
}

.account-switch { margin-top:1.2rem; text-align:center; display:flex; gap:0.6rem; justify-content:center; align-items:center; flex-wrap:wrap; }
.account-switch button { background:none; border:none; cursor:pointer; font-family:Mulish,sans-serif; font-weight:400; font-size:0.7rem; color:#6E3A5A; text-decoration:underline; padding:0; }
.account-switch button:hover { color:#5A2E4A; }
.account-switch span { color:#8C8880; font-size:0.7rem; }

.account-substack { margin-top:2rem; background:#E9EBF6; padding:1.5rem; border-radius:6px; text-align:center; }
.account-substack-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:#6E3A5A; margin-bottom:0.5rem; }
.account-substack p { font-family:'EB Garamond',Georgia,serif; font-size:0.95rem; color:#3D3D3A; line-height:1.6; margin-bottom:0.8rem; }
.account-substack-cta { display:inline-block; font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.15em; text-transform:uppercase; text-decoration:none; color:#6E3A5A; border-bottom:1px solid #6E3A5A; padding-bottom:2px; }
.account-substack-cta:hover { color:#5A2E4A; border-bottom-color:#5A2E4A; }

@media (max-width:640px) {
  .account-page { padding:2rem 1.2rem 3rem; }
  .account-form { padding:1.5rem; }
}
`;

'use client';

/**
 * DecoderQuizPopup — fires 10 seconds after page load on EVERY page.
 *
 * Mounted from the root layout (app/layout.tsx) so it follows visitors
 * who navigate away from the homepage before the 10s timer fires.
 *
 * Suppression logic (revised 16 Jun after user feedback):
 *  - DISMISSED: once the visitor closes the popup, suppress it for the
 *    rest of THIS BROWSER SESSION only (sessionStorage). When they
 *    close the tab/browser and reopen, the popup shows again.
 *  - CTA CLICKED: once they actually click through to the quiz, suppress
 *    for 30 days (localStorage with TTL) — they've engaged, no nag.
 *  - QUIZ URL: don't show when the visitor is already on the quiz pages.
 *
 * Renders nothing on SSR (client-only); never blocks first paint.
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const POPUP_DELAY_MS = 10_000;
const CLICKED_TTL_DAYS = 30;
const SESSION_KEY = 'alw-decoder-popup-session-dismissed';
const CLICKED_KEY = 'alw-decoder-popup-clicked-at';
const QUIZ_URL = '/free/nervous-system-decoder/quiz';
const QUIZ_PATHS_SUPPRESS = ['/free/nervous-system-decoder'];

const HEADLINE = 'How regulated is your nervous system today?';
const BODY = 'A 90-second quiz with five questions. Get your Signal reading and the next small step that fits.';
const CTA = 'Take the quiz';
const DISMISS_LABEL = 'Maybe later';

function isSuppressedThisSession(): boolean {
  if (typeof window === 'undefined') return true;
  try { return sessionStorage.getItem(SESSION_KEY) === '1'; }
  catch { return false; }
}

function isRecentlyClicked(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(CLICKED_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < CLICKED_TTL_DAYS * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

function recordSessionDismissal() {
  try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
}

function recordCtaClick() {
  // Setting both means future sessions ALSO skip for 30 days.
  try { localStorage.setItem(CLICKED_KEY, String(Date.now())); } catch { /* ignore */ }
  recordSessionDismissal();
}

export default function DecoderQuizPopup() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show on the decoder pages themselves — they ARE the destination.
    if (pathname && QUIZ_PATHS_SUPPRESS.some((p) => pathname.startsWith(p))) return;
    if (isSuppressedThisSession()) return;
    if (isRecentlyClicked()) return;
    const timer = setTimeout(() => setVisible(true), POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  const close = () => {
    recordSessionDismissal();
    setVisible(false);
  };

  const handleCta = () => {
    recordCtaClick();
    // Let the <a> navigate normally — don't preventDefault.
  };

  if (!visible) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div
        className="dq-popup-backdrop"
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dq-popup-headline"
      >
        <div className="dq-popup-card">
          <button
            type="button"
            className="dq-popup-close"
            aria-label="Close"
            onClick={close}
          >
            &times;
          </button>
          <p className="dq-popup-kicker">Free &middot; Nervous System Decoder</p>
          <h2 id="dq-popup-headline" className="dq-popup-headline">{HEADLINE}</h2>
          <p className="dq-popup-body">{BODY}</p>
          <div className="dq-popup-actions">
            <a href={QUIZ_URL} className="dq-popup-cta" onClick={handleCta}>
              {CTA} &rarr;
            </a>
            <button type="button" className="dq-popup-dismiss" onClick={close}>
              {DISMISS_LABEL}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = `
.dq-popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(35, 31, 32, 0.55);
  backdrop-filter: blur(3px);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: dq-fade-in 0.32s ease-out;
}
.dq-popup-card {
  position: relative;
  max-width: 480px;
  width: 100%;
  background: #F8F5F0;
  border-radius: 10px;
  padding: 2rem 2rem 1.7rem;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.22);
  animation: dq-pop-in 0.36s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(110, 58, 90, 0.12);
}
.dq-popup-close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #6E3A5A;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dq-popup-close:hover { background: rgba(110, 58, 90, 0.1); }
.dq-popup-kicker {
  font-family: Mulish, system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #C44A7A;
  margin: 0 0 0.85rem;
}
.dq-popup-headline {
  font-family: 'EB Garamond', Georgia, serif;
  font-weight: 400;
  font-size: 1.6rem;
  line-height: 1.3;
  color: #231F20;
  margin: 0 0 0.9rem;
  text-wrap: balance;
}
.dq-popup-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.05rem;
  line-height: 1.6;
  color: #3D3D3A;
  margin: 0 0 1.4rem;
}
.dq-popup-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.dq-popup-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #6E3A5A;
  color: #F5F3EF;
  font-family: Mulish, system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.95rem 1.6rem;
  border-radius: 3px;
  text-decoration: none;
  transition: background 0.2s;
}
.dq-popup-cta:hover { background: #5A2E4A; }
.dq-popup-dismiss {
  background: transparent;
  border: 0;
  font-family: Mulish, system-ui, sans-serif;
  font-weight: 500;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  color: #6E6A62;
  cursor: pointer;
  padding: 0.7rem 0.3rem;
  text-decoration: underline;
}
.dq-popup-dismiss:hover { color: #231F20; }

@keyframes dq-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes dq-pop-in {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 600px) {
  .dq-popup-card { padding: 1.6rem 1.4rem 1.4rem; }
  .dq-popup-headline { font-size: 1.4rem; }
  .dq-popup-body { font-size: 1rem; }
  .dq-popup-cta { padding: 0.85rem 1.3rem; font-size: 0.72rem; }
}
`;

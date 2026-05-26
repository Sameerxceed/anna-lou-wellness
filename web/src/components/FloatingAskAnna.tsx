'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import TurnstileWidget from './TurnstileWidget';

/**
 * FloatingAskAnna — site-wide floating chat widget that talks to Claude.
 *
 * Visible bottom-right on every page (except /ask-anna itself, where the
 * full assessment lives — would be redundant). Collapsed by default as a
 * small button; click expands to a chat panel.
 *
 * Talks to /api/ask-anna in `follow_up` mode. The first user message in a
 * session sends a Turnstile token (gated server-side because history is
 * empty); subsequent messages skip CAPTCHA so the conversation stays fluid.
 *
 * Welcome message offers two paths:
 *   - Quick chat directly here
 *   - Deep-link to /ask-anna for the full 4-question personalised assessment
 *
 * Streaming: same chunk-by-chunk reader as the /ask-anna page — Anna's
 * reply types in word by word.
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: `Hi, I am Anna. Ask me anything about the coaching work, the programmes, or which one might fit where you are. If you want a personal recommendation, take the two-minute assessment — it routes you to the right starting point.`,
};

const SUGGESTIONS = [
  'What is The Reset?',
  'I am overwhelmed — where do I start?',
  'How is this different from therapy?',
  'How do I book a discovery call?',
];

export default function FloatingAskAnna() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [verifiedFirstMessage, setVerifiedFirstMessage] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading, open]);

  // Hide the widget on the dedicated /ask-anna page — would be redundant.
  if (pathname === '/ask-anna') return null;

  async function sendMessage(text: string) {
    const q = text.trim();
    if (!q || loading) return;

    // First message in this session needs Turnstile.
    const isFirstUserMessage = !verifiedFirstMessage;
    if (isFirstUserMessage && !turnstileToken) {
      setError('One moment — verifying you are human. Try again in a few seconds.');
      return;
    }

    setError('');
    setInput('');
    setChat((prev) => [...prev, { role: 'user', content: q }, { role: 'assistant', content: '' }]);
    setLoading(true);

    try {
      // History sent to the server = everything BEFORE the new question.
      // We use the snapshot from before the setChat above (chat at this point).
      // The server expects history without the new question, then question separate.
      const historyForServer = chat.filter((m) => m !== WELCOME); // exclude the canned welcome — it's not part of the model's context

      const res = await fetch('/api/ask-anna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'follow_up',
          history: historyForServer,
          question: q,
          turnstileToken: isFirstUserMessage ? turnstileToken : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Something went wrong.' }));
        setError(data?.error || 'Something went wrong. Please try again.');
        setChat((prev) => prev.slice(0, -1)); // drop the empty assistant placeholder
        return;
      }

      if (isFirstUserMessage) setVerifiedFirstMessage(true);

      const reader = res.body?.getReader();
      if (!reader) {
        setError('Streaming not supported by this browser.');
        setChat((prev) => prev.slice(0, -1));
        return;
      }
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setChat((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: accumulated };
          return next;
        });
      }
    } catch {
      setError('Connection interrupted. Please try again.');
      setChat((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    // Focus the input after the panel animates in.
    setTimeout(() => inputRef.current?.focus(), 300);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: widgetStyles }} />

      {!open && (
        <button
          type="button"
          onClick={handleOpen}
          className="faa-trigger"
          aria-label="Open chat with Anna"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Ask Anna</span>
        </button>
      )}

      {open && (
        <div className="faa-panel" role="dialog" aria-label="Chat with Anna">
          <div className="faa-header">
            <div className="faa-header-text">
              <p className="faa-header-title">Ask Anna</p>
              <p className="faa-header-sub">Coaching recommendations · live AI assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="faa-close"
              aria-label="Close chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="faa-body">
            {chat.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'faa-msg-user' : 'faa-msg-anna'}>
                {msg.content || (loading && i === chat.length - 1 ? <span className="faa-thinking">Anna is thinking…</span> : null)}
                {/* Inline CTA after the canned welcome message only */}
                {i === 0 && msg === WELCOME && (
                  <Link href="/ask-anna" className="faa-assessment-cta" onClick={() => setOpen(false)}>
                    Take the 2-minute assessment <span aria-hidden>→</span>
                  </Link>
                )}
              </div>
            ))}
            {chat.length === 1 && !loading && (
              <div className="faa-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="faa-suggestion"
                    disabled={loading}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {error && <div className="faa-error">{error}</div>}
            <div ref={bottomRef} />
          </div>

          {!verifiedFirstMessage && (
            <div className="faa-turnstile">
              <TurnstileWidget onVerify={setTurnstileToken} size="compact" />
            </div>
          )}

          <form
            className="faa-form"
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="faa-input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || (!verifiedFirstMessage && !turnstileToken)}
              className="faa-send"
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

const widgetStyles = `
.faa-trigger {
  position:fixed; bottom:20px; right:20px; z-index:9000;
  background:#F280AA; color:#fff; border:none;
  padding:12px 18px; border-radius:30px; cursor:pointer;
  font-family:Mulish,sans-serif; font-size:0.7rem; font-weight:600; letter-spacing:0.12em; text-transform:uppercase;
  display:flex; align-items:center; gap:8px;
  box-shadow:0 4px 16px rgba(0,0,0,0.18);
  transition:transform 0.2s, box-shadow 0.2s;
}
.faa-trigger:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.25); }
.faa-trigger svg { flex-shrink:0; }

.faa-panel {
  position:fixed; bottom:20px; right:20px; z-index:9000;
  width:380px; height:560px;
  background:#fff; border-radius:10px;
  box-shadow:0 12px 40px rgba(0,0,0,0.18);
  display:flex; flex-direction:column;
  overflow:hidden;
  animation:faa-slide-in 0.25s ease-out;
}
@keyframes faa-slide-in { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

.faa-header {
  background:#231F20; color:#fff;
  padding:14px 16px;
  display:flex; align-items:center; justify-content:space-between;
}
.faa-header-text { flex:1; }
.faa-header-title { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; font-weight:500; margin:0; line-height:1.2; }
.faa-header-sub { font-family:Mulish,sans-serif; font-size:0.55rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.6); margin:2px 0 0; }
.faa-close { background:transparent; color:#fff; border:none; cursor:pointer; padding:4px; opacity:0.7; transition:opacity 0.2s; }
.faa-close:hover { opacity:1; }

.faa-body {
  flex:1; overflow-y:auto; padding:16px;
  background:#F9F6F1;
  display:flex; flex-direction:column; gap:10px;
}
.faa-msg-anna {
  background:#FCE8EF;
  padding:10px 13px; border-radius:10px 10px 10px 2px;
  font-family:'EB Garamond',Georgia,serif; font-size:0.92rem; line-height:1.55; color:#231F20;
  white-space:pre-wrap;
  align-self:flex-start; max-width:88%;
}
.faa-msg-user {
  background:#231F20; color:#fff;
  padding:10px 13px; border-radius:10px 10px 2px 10px;
  font-family:Mulish,sans-serif; font-size:0.85rem; line-height:1.5;
  align-self:flex-end; max-width:80%;
}
.faa-thinking { font-style:italic; color:#8C8880; font-size:0.85rem; }

.faa-assessment-cta {
  display:inline-block; margin-top:10px;
  font-family:Mulish,sans-serif; font-size:0.6rem; font-weight:600; letter-spacing:0.12em; text-transform:uppercase;
  color:#6E3A5A; text-decoration:none;
  border-bottom:1px solid #6E3A5A; padding-bottom:1px;
}

.faa-suggestions {
  display:flex; flex-direction:column; gap:6px; margin-top:4px;
}
.faa-suggestion {
  background:#fff; border:1px solid #D5D0C8;
  padding:8px 12px; text-align:left; cursor:pointer;
  font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:0.85rem; color:#3D3D3A;
  border-radius:8px; transition:all 0.15s;
}
.faa-suggestion:hover:not(:disabled) { border-color:#F280AA; background:#FCE8EF; }
.faa-suggestion:disabled { opacity:0.5; cursor:not-allowed; }

.faa-error {
  font-family:Mulish,sans-serif; font-size:0.75rem; color:#B12B2B;
  background:#FFF1F1; padding:8px 10px; border-radius:6px;
}

.faa-turnstile {
  padding:8px 16px 0; background:#F9F6F1;
  display:flex; justify-content:center;
}

.faa-form {
  display:flex; gap:6px; padding:10px 12px;
  border-top:1px solid #D5D0C8; background:#fff;
}
.faa-input {
  flex:1; padding:10px 12px;
  border:1px solid #D5D0C8; border-radius:20px;
  font-family:'EB Garamond',Georgia,serif; font-size:0.9rem; color:#231F20;
  outline:none; background:#F9F6F1;
}
.faa-input:focus { border-color:#F280AA; }
.faa-input:disabled { opacity:0.5; }
.faa-send {
  background:#F280AA; color:#fff; border:none;
  width:38px; height:38px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:opacity 0.2s;
  flex-shrink:0;
}
.faa-send:disabled { opacity:0.4; cursor:not-allowed; background:#D5D0C8; }
.faa-send svg { margin-left:-2px; margin-top:1px; }

@media (max-width:480px) {
  .faa-trigger { bottom:14px; right:14px; padding:10px 14px; font-size:0.65rem; }
  .faa-panel {
    bottom:0; right:0; left:0; top:0;
    width:auto; height:100dvh;
    border-radius:0;
  }
}
`;

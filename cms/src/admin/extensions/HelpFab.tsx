/**
 * HelpFab — floating "Ask" button + chat panel on every CMS page.
 *
 * Mounted from app.tsx bootstrap via ReactDOM.createRoot into a portal
 * div appended to document.body, so it survives Strapi's route changes
 * and shows in every corner of the admin (Content Manager, Quick Edit,
 * Settings, login screen excluded).
 *
 * Backend: POST /api/manual-help/ask (same endpoint the Help · Ask
 * sidebar page uses). Self-contained — no Strapi context needed.
 *
 * UX: bottom-right pill button. Tap → 360×520 panel. Same chat shape
 * as ManualHelpPage but compact.
 */

import { useEffect, useRef, useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

const STARTERS = [
  'How do I add a cover image?',
  'How do I publish an article?',
  'Why isn\'t my change showing?',
];

const styles: Record<string, React.CSSProperties> = {
  fab: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 9999,
    background: '#6E3A5A',
    color: '#fff',
    border: 'none',
    borderRadius: 28,
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    letterSpacing: '0.02em',
  },
  fabIcon: { fontSize: 18, lineHeight: 1 },
  panel: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 360,
    maxWidth: 'calc(100vw - 24px)',
    height: 540,
    maxHeight: 'calc(100vh - 48px)',
    zIndex: 9999,
    background: '#fff',
    border: '1px solid #DCDCE4',
    borderRadius: 12,
    boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden',
  },
  header: {
    background: '#6E3A5A',
    color: '#fff',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 18,
    fontWeight: 500,
    margin: 0,
  },
  headerSub: { fontSize: 11, opacity: 0.85, marginTop: 2 },
  close: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 22,
    lineHeight: 1,
    cursor: 'pointer',
    padding: 0,
    width: 28,
    height: 28,
  },
  chat: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 16px',
    background: '#FAFAFB',
  },
  msgUser: {
    background: '#F6EAF0',
    color: '#231F20',
    padding: '8px 12px',
    borderRadius: 12,
    marginLeft: 'auto',
    marginBottom: 8,
    maxWidth: '85%',
    fontSize: 13,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
  msgAssistant: {
    background: '#fff',
    color: '#231F20',
    padding: '10px 12px',
    borderRadius: 12,
    marginRight: 'auto',
    marginBottom: 8,
    maxWidth: '92%',
    fontSize: 13,
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
    border: '1px solid #F0F0F4',
  },
  starters: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 8,
  },
  starter: {
    textAlign: 'left',
    background: '#fff',
    border: '1px solid #E5C9D6',
    color: '#6E3A5A',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  thinking: { fontSize: 12, color: '#8E8EA9', fontStyle: 'italic', padding: 6 },
  inputRow: {
    display: 'flex',
    gap: 6,
    padding: 10,
    borderTop: '1px solid #F0F0F4',
    background: '#fff',
  },
  input: {
    flex: 1,
    border: '1px solid #DCDCE4',
    borderRadius: 6,
    padding: '8px 10px',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'none',
    minHeight: 36,
    maxHeight: 100,
  },
  send: {
    padding: '0 14px',
    background: '#6E3A5A',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  sendDisabled: { background: '#C7C7D0', cursor: 'not-allowed' },
  error: {
    background: '#FFF0F0',
    border: '1px solid #FFB3B3',
    color: '#B33A3A',
    fontSize: 12,
    padding: '6px 10px',
    margin: '0 10px 6px',
    borderRadius: 6,
  },
};

export default function HelpFab() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Hide FAB on Strapi's login screen (no admin cookie yet → endpoint
  // would 401). The login URL always contains /auth/.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return;
      const p = window.location.pathname;
      setHidden(p.includes('/auth/'));
    };
    check();
    window.addEventListener('popstate', check);
    // Strapi uses pushState — patch it to detect SPA navigations.
    const origPush = window.history.pushState;
    window.history.pushState = function (...args) {
      const r = origPush.apply(this, args as any);
      check();
      return r;
    };
    return () => {
      window.removeEventListener('popstate', check);
      window.history.pushState = origPush;
    };
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading, open]);

  const send = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    const next: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setDraft('');
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/manual-help/ask', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, history: messages.slice(-8) }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      const j = await res.json();
      setMessages([...next, { role: 'assistant', content: j?.answer || '(No answer.)' }]);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  };

  if (hidden) return null;

  if (!open) {
    return (
      <button
        type="button"
        style={styles.fab}
        onClick={() => setOpen(true)}
        title="Ask the manual"
      >
        <span style={styles.fabIcon} aria-hidden="true">💬</span>
        Ask
      </button>
    );
  }

  return (
    <div style={styles.panel} role="dialog" aria-label="Help — Ask">
      <div style={styles.header}>
        <div>
          <h3 style={styles.headerTitle}>Help · Ask</h3>
          <div style={styles.headerSub}>Type a question about the CMS</div>
        </div>
        <button
          type="button"
          style={styles.close}
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div style={styles.chat} ref={chatRef}>
        {messages.length === 0 && (
          <div style={styles.starters}>
            {STARTERS.map((q) => (
              <button
                key={q}
                type="button"
                style={styles.starter}
                onClick={() => send(q)}
                disabled={loading}
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={m.role === 'user' ? styles.msgUser : styles.msgAssistant}>
            {m.content}
          </div>
        ))}
        {loading && <div style={styles.thinking}>Looking through the manual...</div>}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.inputRow}>
        <textarea
          style={styles.input}
          placeholder="Ask anything..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          rows={1}
        />
        <button
          type="button"
          style={{
            ...styles.send,
            ...(loading || !draft.trim() ? styles.sendDisabled : {}),
          }}
          onClick={() => send(draft)}
          disabled={loading || !draft.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

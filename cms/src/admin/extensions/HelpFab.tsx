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
  // Optional image attachment — Anna 6 Jul: "I asked the ai assistant
  // but I can't upload an image to show the ai robot the error page."
  const [attached, setAttached] = useState<{ dataUrl: string; mediaType: string; name: string } | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hide FAB on Strapi's login screen (no admin cookie yet → endpoint
  // would 401). The login URL always contains /auth/.
  const [hidden, setHidden] = useState(false);
  // Anna 19 Jul: mobile CMS getting stuck and not scrolling. Root cause —
  // the FAB sits fixed bottom-right, exactly where thumbs land while
  // scrolling. On phones the finger hits the FAB instead of the page and
  // the scroll gesture never registers. Fix: hide the floating FAB on
  // narrow viewports (< 900px so tablets in portrait also get the fix).
  // Anna can still open Help · Ask via the sidebar page in that case.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return;
      const p = window.location.pathname;
      setHidden(p.includes('/auth/'));
      setIsNarrow(window.innerWidth < 900);
    };
    check();
    window.addEventListener('popstate', check);
    window.addEventListener('resize', check);
    // Strapi uses pushState — patch it to detect SPA navigations.
    const origPush = window.history.pushState;
    window.history.pushState = function (...args) {
      const r = origPush.apply(this, args as any);
      check();
      return r;
    };
    return () => {
      window.removeEventListener('popstate', check);
      window.removeEventListener('resize', check);
      window.history.pushState = origPush;
    };
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading, open]);

  // Read a File as base64 (strips the data:mime;base64, prefix).
  const readAsBase64 = (file: File): Promise<{ data: string; mediaType: string; dataUrl: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        const [meta, data] = dataUrl.split(',');
        const media = (meta.match(/data:([^;]+);base64/) || [])[1] || file.type || 'image/png';
        resolve({ data: data || '', mediaType: media, dataUrl });
      };
      reader.onerror = () => reject(reader.error || new Error('File read failed'));
      reader.readAsDataURL(file);
    });

  const attachImage = async (file: File) => {
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setError('Image is too large. Please attach one under 5 MB.');
      return;
    }
    if (!/^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.type)) {
      setError('Only JPG, PNG, GIF, or WebP images can be attached.');
      return;
    }
    try {
      const { data, mediaType, dataUrl } = await readAsBase64(file);
      setAttached({ dataUrl, mediaType, name: file.name });
      setError(null);
      // Small nudge: if the draft is empty, seed a helpful default so the
      // user doesn't have to think about what to type alongside the image.
      if (!draft.trim()) setDraft('What is this? How do I fix it?');
    } catch {
      setError('Could not read that image. Try a JPG or PNG.');
    }
  };

  const send = async (q: string) => {
    const trimmed = q.trim();
    if ((!trimmed && !attached) || loading) return;
    const askText = trimmed || 'What is this? How do I fix it?';
    // Show the image inline in the chat by embedding the data URL as
    // markdown-esque text — quick and dirty but reads naturally.
    const userDisplay = attached
      ? `[Screenshot: ${attached.name}]\n${askText}`
      : askText;
    const next: Message[] = [...messages, { role: 'user', content: userDisplay }];
    setMessages(next);
    setDraft('');
    setError(null);
    setLoading(true);
    const imageForSend = attached
      ? { media_type: attached.mediaType, data: attached.dataUrl.split(',')[1] || '' }
      : null;
    setAttached(null);
    try {
      // Strapi v5 admin stores its JWT in sessionStorage / localStorage
      // under several possible keys depending on build. Grab it and send
      // as Bearer so the controller can verify even when the httpOnly
      // cookie isn't included for some reason.
      const adminJwt =
        (typeof window !== 'undefined' &&
          (window.sessionStorage.getItem('jwtToken') ||
            window.localStorage.getItem('jwtToken') ||
            (() => {
              try {
                const ui = window.sessionStorage.getItem('strapi-userInfo') ||
                  window.localStorage.getItem('strapi-userInfo');
                if (ui) return JSON.parse(ui)?.token || '';
              } catch { /* ignore */ }
              return '';
            })())) || '';

      const res = await fetch('/api/manual-help/ask', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(adminJwt ? { Authorization: `Bearer ${adminJwt.replace(/^"|"$/g, '')}` } : {}),
        },
        body: JSON.stringify({
          question: askText,
          history: messages.slice(-8),
          image: imageForSend,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const errMsg =
          typeof j?.error === 'string'
            ? j.error
            : j?.error?.message || `HTTP ${res.status}`;
        throw new Error(errMsg);
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

  // Paste-to-attach: pasting a screenshot with Ctrl+V into the input
  // populates the attachment (image data lives on the clipboard when
  // Anna does Print Screen or uses the Snipping Tool).
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find((it) => it.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) await attachImage(file);
    }
  };

  if (hidden) return null;
  // Hide the FAB on narrow viewports so the finger doesn't hit it while
  // scrolling (see the isNarrow useEffect above for context).
  if (isNarrow && !open) return null;

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

      {attached && (
        <div style={{ padding: '6px 10px', borderTop: '1px solid #F0F0F4', display: 'flex', alignItems: 'center', gap: 10, background: '#fff' }}>
          <img src={attached.dataUrl} alt={attached.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid #E5C9D6' }} />
          <span style={{ flex: 1, fontSize: 11, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attached.name}</span>
          <button
            type="button"
            onClick={() => setAttached(null)}
            style={{ background: 'transparent', border: 'none', color: '#8E8EA9', cursor: 'pointer', fontSize: 16, padding: 0 }}
            aria-label="Remove attachment"
          >
            ×
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) attachImage(f);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
      />

      <div style={styles.inputRow}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          title="Attach a screenshot"
          style={{
            background: 'transparent',
            border: '1px solid #DCDCE4',
            borderRadius: 6,
            padding: '0 10px',
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#6E3A5A',
          }}
        >
          📎
        </button>
        <textarea
          style={styles.input}
          placeholder={attached ? 'Describe what you want help with...' : 'Ask anything... (Ctrl+V a screenshot)'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onPaste={handlePaste}
          disabled={loading}
          rows={1}
        />
        <button
          type="button"
          style={{
            ...styles.send,
            ...(loading || (!draft.trim() && !attached) ? styles.sendDisabled : {}),
          }}
          onClick={() => send(draft)}
          disabled={loading || (!draft.trim() && !attached)}
        >
          Send
        </button>
      </div>
    </div>
  );
}

/**
 * ManualHelpPage — admin sidebar page that lets Anna ask questions
 * about how to use the CMS and get answers grounded in the user manual.
 *
 * Backend: POST /api/manual-help/ask (cms/src/api/manual-help/*) which
 * sends Anna's question + recent chat history + the bundled
 * ANNA_USER_MANUAL.md to Claude Haiku and returns the answer.
 *
 * Auth: credentials: 'include' sends Strapi v5 httpOnly admin cookie.
 * Cost: ~$0.001 per question on Haiku with 5-min prompt cache.
 */

import { useEffect, useRef, useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const STARTER_QUESTIONS = [
  'How do I add a cover image to a service?',
  'How do I add a new article?',
  'Why is my change not showing on the website?',
  'How do I upload many photos at once?',
];

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 24,
    maxWidth: 860,
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  h1: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 500,
    fontSize: 32,
    margin: '8px 0 4px',
  },
  intro: {
    color: '#666687',
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 1.6,
  },
  starterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  starter: {
    padding: '8px 12px',
    background: '#F6EAF0',
    color: '#6E3A5A',
    border: '1px solid #E5C9D6',
    borderRadius: 20,
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  chat: {
    flex: 1,
    background: '#fff',
    border: '1px solid #DCDCE4',
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
    overflowY: 'auto',
    minHeight: 360,
  },
  msgUser: {
    background: '#F6EAF0',
    color: '#231F20',
    padding: '10px 14px',
    borderRadius: 14,
    marginLeft: 'auto',
    marginBottom: 10,
    maxWidth: '85%',
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
  msgAssistant: {
    background: '#FAFAFB',
    color: '#231F20',
    padding: '12px 16px',
    borderRadius: 14,
    marginRight: 'auto',
    marginBottom: 10,
    maxWidth: '92%',
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    border: '1px solid #F0F0F4',
  },
  empty: {
    color: '#8E8EA9',
    fontSize: 13,
    textAlign: 'center',
    padding: '40px 20px',
    lineHeight: 1.6,
  },
  thinking: {
    color: '#8E8EA9',
    fontSize: 13,
    fontStyle: 'italic',
    padding: '8px 14px',
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    background: '#fff',
    border: '1px solid #DCDCE4',
    borderRadius: 6,
    padding: 8,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '10px 12px',
    fontSize: 14,
    fontFamily: 'inherit',
    resize: 'none',
    minHeight: 44,
    maxHeight: 160,
  },
  send: {
    padding: '0 18px',
    background: '#6E3A5A',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.04em',
  },
  sendDisabled: {
    background: '#C7C7D0',
    cursor: 'not-allowed',
  },
  error: {
    padding: 12,
    background: '#FFF0F0',
    border: '1px solid #FFB3B3',
    color: '#B33A3A',
    fontSize: 13,
    borderRadius: 4,
    marginBottom: 12,
  },
  reset: {
    background: 'transparent',
    border: 'none',
    color: '#6E3A5A',
    cursor: 'pointer',
    fontSize: 12,
    textDecoration: 'underline',
    padding: 0,
    marginLeft: 'auto',
    fontFamily: 'inherit',
  },
};

export default function ManualHelpPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: trimmed },
    ];
    setMessages(newMessages);
    setDraft('');
    setError(null);
    setLoading(true);

    try {
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
          question: trimmed,
          history: messages.slice(-8),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg =
          typeof data?.error === 'string'
            ? data.error
            : data?.error?.message || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }
      const data = await res.json();
      const answer: string = data?.answer || '(No answer.)';
      setMessages([...newMessages, { role: 'assistant', content: answer }]);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Try again.');
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

  const reset = () => {
    setMessages([]);
    setError(null);
    setDraft('');
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Help · Ask</h1>
      <p style={styles.intro}>
        Type any question about editing your website and I'll find the answer in your user manual.
        Examples: "how do I add a cover image to a service?", "how do I publish a draft article?", "where do I change the homepage hero?".
        {messages.length > 0 && (
          <button type="button" style={styles.reset} onClick={reset}>
            Clear chat
          </button>
        )}
      </p>

      {messages.length === 0 && (
        <div style={styles.starterRow}>
          {STARTER_QUESTIONS.map((q) => (
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

      <div style={styles.chat} ref={chatRef}>
        {messages.length === 0 && !loading && (
          <div style={styles.empty}>
            Ask a question to get started.
            <br />
            Press Enter to send, Shift+Enter for a new line.
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
          placeholder="Ask anything about the CMS..."
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
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

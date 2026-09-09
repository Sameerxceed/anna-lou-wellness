/**
 * GenerateSeoPanel — sidebar panel shown on every Strapi edit page that
 * reads the entry's title + description, calls Claude via
 * /api/seo-generator/generate, and shows back an SEO title + meta
 * description Anna can copy into the seo_title / seo_description fields.
 *
 * Why not auto-fill the form? Strapi v5's admin form state lives inside the
 * content-manager plugin's React context — reaching it from an injected
 * component is brittle across versions. Copy-to-clipboard works on every
 * version, is visible (Anna sees what AI wrote before committing), and is
 * faster to ship.
 *
 * Injected via `app.getPlugin('content-manager').injectComponent('editView',
 * 'right-links', ...)` in src/admin/app.tsx.
 */

import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

// ─── Auth + fetch (same shape as RelatedItemsPanel) ───────────────────────
let loggedAuthDiscovery = false;
const getAdminToken = (): string | null => {
  const keys = ['jwtToken', 'strapi-jwt-token', 'jwt'];
  const read = (s: Storage | undefined, k: string): string | null => {
    if (!s) return null;
    const raw = s.getItem(k);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string') return parsed;
    } catch { /* raw */ }
    return raw;
  };
  const session = typeof sessionStorage !== 'undefined' ? sessionStorage : undefined;
  const local = typeof localStorage !== 'undefined' ? localStorage : undefined;
  for (const k of keys) {
    const fromSession = read(session, k);
    if (fromSession) {
      if (!loggedAuthDiscovery) {
        loggedAuthDiscovery = true;
        // eslint-disable-next-line no-console
        console.info(`[GenerateSeo] admin token via sessionStorage["${k}"]`);
      }
      return fromSession;
    }
    const fromLocal = read(local, k);
    if (fromLocal) {
      if (!loggedAuthDiscovery) {
        loggedAuthDiscovery = true;
        // eslint-disable-next-line no-console
        console.info(`[GenerateSeo] admin token via localStorage["${k}"]`);
      }
      return fromLocal;
    }
  }
  return null;
};

const adminFetch = async (path: string, init?: RequestInit) => {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init?.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const res = await fetch(path, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }
  return res.json();
};

// ─── Helpers ───────────────────────────────────────────────────────────────

type ParsedContext = { uid: string; documentId: string; kind: 'collection-type' | 'single-type' } | null;

function parseEditContext(pathname: string): ParsedContext {
  // /content-manager/collection-types/api::experience.experience/abc123
  // /content-manager/single-types/api::homepage.homepage
  const m = pathname.match(/\/content-manager\/(collection-types|single-types)\/([^/]+)(?:\/([^/?#]+))?/);
  if (!m) return null;
  const kind = m[1] === 'collection-types' ? 'collection-type' : 'single-type';
  const uid = m[2];
  const documentId = m[3] || '';
  if (kind === 'collection-type' && !documentId) return null;
  return { kind, uid, documentId };
}

const NAME_FIELDS = ['title', 'name', 'heroTitle', 'hero_title', 'productName', 'product_name'];
const DESC_FIELDS = [
  'description', 'body', 'intro', 'longDescription', 'long_description',
  'heroBody', 'hero_body', 'excerpt', 'summary', 'subtitle',
];

function flattenContent(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map((node) => {
      if (!node) return '';
      if (typeof node === 'string') return node;
      const n = node as { children?: unknown[]; text?: string };
      if (Array.isArray(n.children)) {
        return n.children.map((c) => (typeof c === 'string' ? c : (c as { text?: string })?.text || '')).join('');
      }
      return n.text || '';
    }).filter(Boolean).join('\n\n');
  }
  if (typeof value === 'object') {
    const n = value as { children?: unknown[]; text?: string };
    if (Array.isArray(n.children)) {
      return n.children.map((c) => (c as { text?: string })?.text || '').join('');
    }
  }
  return String(value);
}

function pickField(entry: Record<string, unknown>, candidates: string[]): string {
  for (const k of candidates) {
    if (entry[k] != null && entry[k] !== '') {
      const flat = flattenContent(entry[k]).trim();
      if (flat) return flat;
    }
  }
  return '';
}

// ─── Component ─────────────────────────────────────────────────────────────

type GeneratedResult = { seo_title: string; seo_description: string };

const styles = {
  card: {
    background: '#fff', border: '1px solid #DCDCE4', borderRadius: 4,
    padding: '12px 14px', marginBottom: 12, fontSize: 13,
  } as React.CSSProperties,
  title: {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, color: '#666687', marginBottom: 8,
  } as React.CSSProperties,
  button: {
    width: '100%', padding: '8px 12px', background: '#6E3A5A', color: '#fff',
    border: 0, borderRadius: 4, cursor: 'pointer', fontWeight: 600,
    fontSize: 12, letterSpacing: '0.04em',
  } as React.CSSProperties,
  buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' } as React.CSSProperties,
  resultBlock: { marginTop: 10, paddingTop: 10, borderTop: '1px solid #EAEAEF' } as React.CSSProperties,
  fieldLabel: { fontSize: 10, fontWeight: 600, color: '#666687', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4 } as React.CSSProperties,
  fieldValue: { fontSize: 12, color: '#32324D', background: '#F6F6F9', padding: '6px 8px', borderRadius: 3, marginBottom: 6, whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const } as React.CSSProperties,
  copyBtn: { padding: '4px 10px', fontSize: 11, background: '#fff', color: '#6E3A5A', border: '1px solid #6E3A5A', borderRadius: 3, cursor: 'pointer', marginRight: 6 } as React.CSSProperties,
  copied: { color: '#0A7A3B' } as React.CSSProperties,
  error: { color: '#B72B1A', fontSize: 12, marginTop: 8 } as React.CSSProperties,
  hint: { fontSize: 11, color: '#666687', marginTop: 8, lineHeight: 1.5 } as React.CSSProperties,
};

export default function GenerateSeoPanel() {
  const { pathname } = useLocation();
  const ctx = useMemo(() => parseEditContext(pathname), [pathname]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [copied, setCopied] = useState<'title' | 'description' | null>(null);

  if (!ctx) return null;

  const handleGenerate = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    setCopied(null);
    try {
      // Pull the current entry from the content-manager admin API.
      const entryUrl = ctx.kind === 'collection-type'
        ? `/content-manager/collection-types/${ctx.uid}/${ctx.documentId}`
        : `/content-manager/single-types/${ctx.uid}`;
      const data = await adminFetch(entryUrl);
      // Strapi sometimes wraps in { data: ... }, sometimes the entry is at root.
      const entry = (data?.data ?? data) as Record<string, unknown>;

      const name = pickField(entry, NAME_FIELDS);
      const description = pickField(entry, DESC_FIELDS);

      if (!name) {
        setError("Couldn't find a title/name field on this entry. Save the entry with a title first, then try again.");
        return;
      }

      const gen = await adminFetch('/api/seo-generator/generate', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      if (!gen?.ok || !gen?.seo_title || !gen?.seo_description) {
        setError(gen?.error || 'Generation failed — try again.');
        return;
      }
      setResult({ seo_title: gen.seo_title, seo_description: gen.seo_description });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string, which: 'title' | 'description') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError('Copy failed — select the text manually.');
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.title}>Generate SEO</div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={busy}
        style={{ ...styles.button, ...(busy ? styles.buttonDisabled : {}) }}
      >
        {busy ? 'Generating…' : 'Generate SEO from this entry'}
      </button>
      <p style={styles.hint}>
        Reads this entry's title + description and writes an SEO title + meta description in Anna's voice. Copy each into the SEO fields below.
      </p>

      {error && <div style={styles.error}>{error}</div>}

      {result && (
        <div style={styles.resultBlock}>
          <div style={styles.fieldLabel}>seo_title</div>
          <div style={styles.fieldValue}>{result.seo_title}</div>
          <button type="button" style={{ ...styles.copyBtn, ...(copied === 'title' ? styles.copied : {}) }} onClick={() => copy(result.seo_title, 'title')}>
            {copied === 'title' ? 'Copied' : 'Copy title'}
          </button>

          <div style={{ ...styles.fieldLabel, marginTop: 12 }}>seo_description</div>
          <div style={styles.fieldValue}>{result.seo_description}</div>
          <button type="button" style={{ ...styles.copyBtn, ...(copied === 'description' ? styles.copied : {}) }} onClick={() => copy(result.seo_description, 'description')}>
            {copied === 'description' ? 'Copied' : 'Copy description'}
          </button>
        </div>
      )}
    </div>
  );
}

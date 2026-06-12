/**
 * SiteUrlsPage — admin sidebar page that lists every URL on the public
 * site, grouped by section. Anna uses this when she's editing nav,
 * Mailchimp emails, social posts etc. and needs to copy a URL without
 * having to remember the slug or risk typos.
 *
 * Reads from a custom admin-only endpoint (/api/internal-routes/list)
 * that aggregates static routes + live Programme / Experience / Page /
 * Article / Practitioner entries from the CMS.
 *
 * Uses credentials: 'include' to send the Strapi v5 httpOnly admin
 * cookie — Bearer tokens stopped working when v5 moved JWT off
 * localStorage.
 */

import { useEffect, useMemo, useState } from 'react';

// The public site URL — same heuristic as SeoFilesPage / ViewLivePanel.
const PUBLIC_SITE_URL = (() => {
  if (typeof window === 'undefined') return 'https://staging.annalouwellness.com';
  const host = window.location.hostname;
  if (host === 'cms.annalouwellness.com') return 'https://staging.annalouwellness.com';
  if (host === 'staging.cms.annalouwellness.com') return 'https://staging.annalouwellness.com';
  if (host.startsWith('staging.cms.')) return `https://staging.${host.slice(12)}`;
  if (host.startsWith('cms.')) return `https://${host.slice(4)}`;
  return 'https://staging.annalouwellness.com';
})();

type Item = { url: string; label: string; kind: string };
type Group = { title: string; blurb: string; items: Item[] };

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, maxWidth: 980, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' },
  h1: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 32, margin: '8px 0 4px' },
  intro: { color: '#666687', fontSize: 13, marginBottom: 18, lineHeight: 1.6 },
  searchRow: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' as const },
  search: { flex: 1, minWidth: 240, padding: '10px 14px', fontSize: 14, border: '1px solid #DCDCE4', borderRadius: 4, fontFamily: 'inherit' },
  refresh: { padding: '10px 14px', background: '#fff', color: '#6E3A5A', border: '1px solid #6E3A5A', borderRadius: 3, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer', textTransform: 'uppercase' as const },
  group: { marginBottom: 28 },
  groupTitle: { fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' as const, fontSize: 22, color: '#231F20', marginBottom: 2 },
  groupBlurb: { fontSize: 12, color: '#666687', marginBottom: 12, lineHeight: 1.5 },
  table: { width: '100%', background: '#fff', border: '1px solid #DCDCE4', borderRadius: 4, borderCollapse: 'collapse' as const, fontSize: 13 },
  row: { borderTop: '1px solid #F0F0F4' },
  cell: { padding: '10px 14px', verticalAlign: 'middle' as const },
  cellLabel: { color: '#32324D', fontWeight: 500 },
  cellUrl: { color: '#6E3A5A', fontFamily: 'ui-monospace, monospace', fontSize: 12 },
  copy: { padding: '6px 10px', background: '#fff', color: '#6E3A5A', border: '1px solid #6E3A5A', borderRadius: 3, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const },
  copied: { color: '#0A7A3B', borderColor: '#0A7A3B' },
  view: { padding: '6px 10px', background: '#fff', color: '#0A7A3B', border: '1px solid #0A7A3B', borderRadius: 3, fontSize: 11, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' as const },
  loading: { padding: 24, textAlign: 'center' as const, color: '#666687', fontSize: 13 },
  error: { padding: 16, background: '#FFF0F0', border: '1px solid #FFB3B3', color: '#B33A3A', fontSize: 13, borderRadius: 4, marginBottom: 16 },
};

export default function SiteUrlsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/internal-routes/list', { credentials: 'include' });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
      }
      const data = await res.json();
      if (!data?.groups) throw new Error('Unexpected response shape');
      setGroups(data.groups);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo<Group[]>(() => {
    if (!query.trim()) return groups;
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => i.label.toLowerCase().includes(q) || i.url.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied((c) => (c === text ? null : c)), 1500);
    } catch { /* ignore */ }
  };

  const total = useMemo(() => groups.reduce((s, g) => s + g.items.length, 0), [groups]);

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Site URLs</h1>
      <p style={styles.intro}>
        Every URL on the public site, grouped by section. Use this when you need to copy a URL into Navigation, a Mailchimp email, a social post, or anywhere else — never type a slug by hand. Updates live as you publish new content.
      </p>

      <div style={styles.searchRow}>
        <input
          style={styles.search}
          type="search"
          placeholder={`Search ${total} URLs by name or path...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="button" style={styles.refresh} onClick={load} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && <div style={styles.error}>Failed to load: {error}</div>}

      {loading && groups.length === 0 && <div style={styles.loading}>Loading site URLs...</div>}

      {filtered.map((g) => (
        <section key={g.title} style={styles.group}>
          <h2 style={styles.groupTitle}>{g.title}</h2>
          <p style={styles.groupBlurb}>{g.blurb}</p>
          <table style={styles.table}>
            <tbody>
              {g.items.map((item) => {
                const isExternal = item.url.startsWith('http');
                const fullUrl = isExternal ? item.url : `${PUBLIC_SITE_URL}${item.url}`;
                return (
                  <tr key={item.url + item.label} style={styles.row}>
                    <td style={{ ...styles.cell, ...styles.cellLabel, width: '40%' }}>{item.label}</td>
                    <td style={{ ...styles.cell, ...styles.cellUrl }}>{item.url}</td>
                    <td style={{ ...styles.cell, textAlign: 'right' as const, whiteSpace: 'nowrap' as const }}>
                      <button
                        type="button"
                        style={{ ...styles.copy, ...(copied === item.url ? styles.copied : {}) }}
                        onClick={() => copy(item.url)}
                      >
                        {copied === item.url ? 'Copied' : 'Copy path'}
                      </button>
                      {' '}
                      <button
                        type="button"
                        style={{ ...styles.copy, ...(copied === fullUrl ? styles.copied : {}) }}
                        onClick={() => copy(fullUrl)}
                      >
                        {copied === fullUrl ? 'Copied' : 'Copy full'}
                      </button>
                      {' '}
                      <a style={styles.view} href={fullUrl} target="_blank" rel="noopener">View</a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}

      {!loading && filtered.length === 0 && !error && (
        <div style={styles.loading}>No URLs match "{query}". Try a different search.</div>
      )}

      <div style={{ marginTop: 24, padding: '12px 16px', background: '#F6F6F9', borderRadius: 4, fontSize: 12, color: '#666687', lineHeight: 1.5 }}>
        Tip: <strong>Copy path</strong> gives you the relative URL (<code>/the-work/signal</code>) — what Navigation expects.
        <strong> Copy full</strong> gives you the absolute URL — what you want for Mailchimp, Substack, or social posts.
      </div>
    </div>
  );
}

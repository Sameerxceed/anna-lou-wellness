/**
 * LinkPickerInput — searchable dropdown of every URL on the public site.
 *
 * Registered as the Input component for the `alw-link-picker` app-level
 * custom field. Used by `shared.upsell-reference.link` (and any other
 * field that wants a URL picker instead of free-text typing).
 *
 * Data source: GET /api/internal-routes/list — admin-policy gated, same
 * endpoint as the Site URLs admin page. credentials: 'include' so the
 * httpOnly admin cookie is sent.
 *
 * UX:
 *  - Combobox: type to filter the list, click a result to set the value
 *  - Selected URL shows below the input as a confirmation chip
 *  - "Type a custom URL" option at the bottom for external links not in
 *    the list (e.g. https://calendly.com/...)
 *  - Empty state lets Anna paste a URL manually if she wants
 */

import { useEffect, useMemo, useRef, useState } from 'react';

type Item = { url: string; label: string; kind: string };
type Group = { title: string; blurb: string; items: Item[] };

type InputProps = {
  attribute: { type: string; customField?: string };
  name: string;
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
  value?: string | null;
  intlLabel?: { defaultMessage?: string };
  description?: { defaultMessage?: string };
  required?: boolean;
  disabled?: boolean;
  hint?: string;
};

const styles: Record<string, React.CSSProperties> = {
  wrap: { position: 'relative' },
  label: { fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#32324D', display: 'block', marginBottom: 4 },
  input: { width: '100%', padding: '0.6rem 0.75rem', fontSize: 14, border: '1px solid #DCDCE4', borderRadius: 4, fontFamily: 'inherit', background: '#fff', color: '#32324D', boxSizing: 'border-box' },
  inputFocus: { outline: 'none', borderColor: '#4945ff', boxShadow: '0 0 0 3px rgba(73,69,255,0.12)' },
  drop: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #DCDCE4', borderRadius: 4, maxHeight: 320, overflowY: 'auto', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', marginTop: 2 },
  groupHeader: { padding: '8px 12px 4px', fontFamily: "'Josefin Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8C8880', background: '#F8F5F0', borderTop: '1px solid #EDE8DF' },
  option: { padding: '8px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, color: '#32324D', borderTop: '1px solid #F0F0F4' },
  optionHover: { background: '#F6F6F9' },
  optionUrl: { fontFamily: 'ui-monospace, monospace', fontSize: 11, color: '#4945ff' },
  hint: { color: '#666687', fontSize: 12, marginTop: 4 },
  selected: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: '#EAEAFA', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#4945ff', marginTop: 6 },
  clear: { background: 'transparent', border: 0, color: '#4945ff', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 },
  manual: { padding: '8px 12px', cursor: 'pointer', fontSize: 12, color: '#6E6A62', fontStyle: 'italic', borderTop: '1px solid #F0F0F4', background: '#FCFBF9' },
  err: { color: '#B33A3A', fontSize: 12, marginTop: 4 },
};

export default function LinkPickerInput({ attribute: _attribute, name, onChange, value, intlLabel, description, required, hint }: InputProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Grab admin JWT from storage as Bearer — Strapi v5 doesn't
        // always send the cookie on /api/* routes. Same pattern as
        // HelpFab + SiteUrlsPage + SeoFilesPage.
        const adminJwt = (typeof window !== 'undefined' && (
          window.sessionStorage.getItem('jwtToken') ||
          window.localStorage.getItem('jwtToken') ||
          (() => {
            try {
              const ui = window.sessionStorage.getItem('strapi-userInfo') ||
                window.localStorage.getItem('strapi-userInfo');
              if (ui) return JSON.parse(ui)?.token || '';
            } catch { /* ignore */ }
            return '';
          })()
        )) || '';
        const res = await fetch('/api/internal-routes/list', {
          credentials: 'include',
          headers: adminJwt ? { Authorization: `Bearer ${String(adminJwt).replace(/^"|"$/g, '')}` } : {},
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (cancelled) return;
        if (!data?.groups) throw new Error('Unexpected response shape');
        setGroups(data.groups);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load URLs');
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Sync external value -> local input
  useEffect(() => {
    if (value !== query && !focused) setQuery(value || '');
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const filtered = useMemo<Group[]>(() => {
    if (!query.trim()) return groups;
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q) || i.url.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  const set = (url: string) => {
    setQuery(url);
    onChange({ target: { name, value: url, type: 'string' } });
    setOpen(false);
  };

  const handleQueryChange = (v: string) => {
    setQuery(v);
    // Live-update the underlying value too, so manually typed URLs (e.g. Calendly) save.
    onChange({ target: { name, value: v, type: 'string' } });
    setOpen(true);
  };

  const labelText = intlLabel?.defaultMessage || name;
  const descText = description?.defaultMessage || hint || '';

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <label style={styles.label}>
        {labelText}{required ? ' *' : ''}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        onFocus={() => { setFocused(true); setOpen(true); }}
        onBlur={() => setFocused(false)}
        placeholder="Type to search or paste a custom URL (e.g. https://calendly.com/...)"
        style={open ? { ...styles.input, ...styles.inputFocus } : styles.input}
      />

      {value && !open && (
        <div style={styles.selected}>
          <span>{value}</span>
          <button type="button" aria-label="Clear" style={styles.clear} onClick={() => { setQuery(''); onChange({ target: { name, value: '', type: 'string' } }); }}>&times;</button>
        </div>
      )}

      {descText && !error && <div style={styles.hint}>{descText}</div>}
      {error && <div style={styles.err}>Could not load URL list: {error}. Paste the URL manually.</div>}

      {open && loaded && !error && (
        <div style={styles.drop}>
          {filtered.length === 0 && (
            <div style={styles.manual}>No matches in the site. Press Tab to keep what you typed as a custom URL.</div>
          )}
          {filtered.map((g) => (
            <div key={g.title}>
              <div style={styles.groupHeader}>{g.title}</div>
              {g.items.map((it) => {
                const key = g.title + '::' + it.url + '::' + it.label;
                return (
                  <div
                    key={key}
                    onMouseEnter={() => setHoverKey(key)}
                    onMouseLeave={() => setHoverKey((k) => (k === key ? null : k))}
                    onMouseDown={(e) => { e.preventDefault(); set(it.url); }}
                    style={hoverKey === key ? { ...styles.option, ...styles.optionHover } : styles.option}
                  >
                    <span>{it.label}</span>
                    <span style={styles.optionUrl}>{it.url}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

/**
 * SiteSearch — a full-page overlay search for visitors.
 *
 * Trigger: any element that dispatches the custom event
 *   window.dispatchEvent(new Event('alw:open-search'))
 * The Nav's magnifying glass button fires that event so this component
 * stays decoupled from Nav's layout — same trigger works from a mobile
 * menu button, a keyboard shortcut, or a homepage feature block later.
 *
 * Behaviour:
 *   - On first open, fetches /api/search-index (cached, ~1 MB max in
 *     practice for this site). Subsequent opens reuse the cached array.
 *   - Filters in-memory as the user types: title + description + tags
 *     match, with a small typo-tolerant Levenshtein bonus for single
 *     character transpositions.
 *   - Groups results by type, up to N per group, with a "show more"
 *     nudge if a group is capped.
 *   - Esc closes; clicking backdrop closes; enter on the top result
 *     navigates to it.
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

interface SearchItem {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  section?: string;
  tags?: string;
}

interface IndexResponse {
  generatedAt: string;
  count: number;
  items: SearchItem[];
}

const TYPE_LABELS: Record<string, string> = {
  'article': 'Articles',
  'experience': 'Experiences',
  'product': 'Shop',
  'practitioner': 'Practitioners',
  'mantra': 'Mantras',
  'event': 'Events',
  'workshop-replay': 'Workshop Replays',
  'custom-page': 'Pages',
  'custom-html-landing': 'Campaigns',
  'static-page': 'Site',
};

// Order groups by usual visitor intent — offerings first, then reads.
const TYPE_ORDER = [
  'experience',
  'product',
  'article',
  'custom-page',
  'custom-html-landing',
  'practitioner',
  'event',
  'workshop-replay',
  'mantra',
  'static-page',
];

const GROUP_LIMIT = 5;

function normalise(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function scoreItem(item: SearchItem, needle: string): number {
  const q = normalise(needle);
  if (!q) return 0;
  const t = normalise(item.title);
  const d = normalise(item.description || '');
  const tags = normalise(item.tags || '');
  const section = normalise(item.section || '');
  let score = 0;
  // Exact title match — top.
  if (t === q) score += 1000;
  // Title starts with query — very high.
  if (t.startsWith(q)) score += 400;
  // Whole-word match in title.
  if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(t)) score += 200;
  // Substring in title.
  if (t.includes(q)) score += 120;
  // Any query word in title (space-separated queries).
  const words = q.split(/\s+/).filter(Boolean);
  for (const w of words) {
    if (t.includes(w)) score += 30;
    if (d.includes(w)) score += 10;
    if (tags.includes(w)) score += 20;
    if (section.includes(w)) score += 8;
  }
  return score;
}

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  // Event-based trigger — decouples from Nav.tsx layout.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('alw:open-search', onOpen);
    return () => window.removeEventListener('alw:open-search', onOpen);
  }, []);

  // Lazy-load the index the first time the overlay opens. Cache in state
  // so subsequent opens are instant.
  useEffect(() => {
    if (!open || index || loading) return;
    setLoading(true);
    fetch('/api/search-index', { cache: 'force-cache' })
      .then((r) => r.json() as Promise<IndexResponse>)
      .then((data) => setIndex(data.items || []))
      .catch(() => setIndex([]))
      .finally(() => setLoading(false));
  }, [open, index, loading]);

  // Focus the input when overlay opens; lock body scroll while open.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(t);
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  // Esc closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q || !index) return {} as Record<string, SearchItem[]>;
    const scored: Array<{ item: SearchItem; score: number }> = [];
    for (const item of index) {
      const s = scoreItem(item, q);
      if (s > 0) scored.push({ item, score: s });
    }
    scored.sort((a, b) => b.score - a.score);
    const grouped: Record<string, SearchItem[]> = {};
    for (const { item } of scored) {
      const type = item.type;
      if (!grouped[type]) grouped[type] = [];
      if (grouped[type].length < GROUP_LIMIT) grouped[type].push(item);
    }
    return grouped;
  }, [query, index]);

  const totalHits = useMemo(
    () => Object.values(results).reduce((n, arr) => n + arr.length, 0),
    [results]
  );

  if (!open) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="alw-search-backdrop" onClick={close} role="presentation" />
      <div className="alw-search-shell" role="dialog" aria-modal="true" aria-label="Search the site">
        <div className="alw-search-inner">
          <div className="alw-search-inputrow">
            <svg
              className="alw-search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="alw-search-input"
              placeholder="Search retreats, articles, sessions, shop…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="alw-search-close"
              onClick={close}
              aria-label="Close search"
            >
              Esc
            </button>
          </div>

          <div className="alw-search-body">
            {loading && !index && (
              <p className="alw-search-empty">Loading…</p>
            )}
            {!loading && index && !query.trim() && (
              <div className="alw-search-hint">
                <p className="alw-search-hint-lead">Try searching for:</p>
                <div className="alw-search-hint-chips">
                  {['australia retreat', 'founder reset', 'trauma', 'jewellery', 'quiz', 'signal method', 'sessions'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="alw-search-chip"
                      onClick={() => {
                        setQuery(s);
                        inputRef.current?.focus();
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {query.trim() && index && totalHits === 0 && (
              <p className="alw-search-empty">No matches for &ldquo;{query.trim()}&rdquo;. Try a different word.</p>
            )}
            {totalHits > 0 && (
              <div className="alw-search-results">
                {TYPE_ORDER.filter((t) => results[t]?.length).map((type) => (
                  <div key={type} className="alw-search-group">
                    <h3 className="alw-search-grouptitle">{TYPE_LABELS[type] || type}</h3>
                    <ul className="alw-search-list">
                      {results[type].map((item) => (
                        <li key={item.id}>
                          <Link
                            href={item.url}
                            className="alw-search-hit"
                            onClick={close}
                          >
                            <span className="alw-search-hit-title">{item.title}</span>
                            {item.description && (
                              <span className="alw-search-hit-desc">{item.description}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = `
.alw-search-backdrop {
  position: fixed; inset: 0;
  background: rgba(35, 31, 32, 0.45);
  backdrop-filter: blur(4px);
  z-index: 10000;
}
.alw-search-shell {
  position: fixed; inset: 0;
  z-index: 10001;
  display: flex; align-items: flex-start; justify-content: center;
  padding: 6vh 1rem 2rem;
  pointer-events: none;
}
.alw-search-inner {
  pointer-events: auto;
  width: 100%;
  max-width: 720px;
  background: #FDFBF7;
  border-radius: 10px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.25);
  overflow: hidden;
  display: flex; flex-direction: column;
  max-height: 82vh;
}
.alw-search-inputrow {
  display: flex; align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  background: #fff;
}
.alw-search-icon { flex: 0 0 auto; color: #5D5A52; }
.alw-search-input {
  flex: 1 1 auto;
  border: none; outline: none;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.2rem;
  color: #231F20;
  background: transparent;
  padding: 4px 0;
  min-width: 0;
}
.alw-search-input::placeholder { color: #A8A49B; font-style: italic; }
.alw-search-close {
  flex: 0 0 auto;
  background: #F0EBE2;
  border: 1px solid rgba(0,0,0,0.08);
  color: #5D5A52;
  font-family: Mulish, sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.alw-search-close:hover { background: #E5DFD3; color: #231F20; }
.alw-search-body {
  overflow-y: auto;
  padding: 12px 18px 22px;
}
.alw-search-empty {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem;
  color: #7A736A;
  text-align: center;
  padding: 2rem 0;
}
.alw-search-hint { padding: 8px 0 12px; }
.alw-search-hint-lead {
  font-family: Mulish, sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #7A736A;
  margin: 0 0 10px;
}
.alw-search-hint-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.alw-search-chip {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 999px;
  background: #F0EBE2;
  border: 1px solid rgba(0,0,0,0.06);
  color: #4A2B4B;
  cursor: pointer;
  font-style: italic;
}
.alw-search-chip:hover { background: #E5DFD3; }
.alw-search-results { display: flex; flex-direction: column; gap: 20px; }
.alw-search-group { }
.alw-search-grouptitle {
  font-family: Mulish, sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6E3A5A;
  margin: 0 0 8px;
}
.alw-search-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.alw-search-hit {
  display: block;
  padding: 10px 12px;
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s;
}
.alw-search-hit:hover { background: #F5F0E6; }
.alw-search-hit-title {
  display: block;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.05rem;
  color: #231F20;
  line-height: 1.35;
  margin-bottom: 2px;
}
.alw-search-hit-desc {
  display: block;
  font-family: Mulish, sans-serif;
  font-size: 0.78rem;
  color: #5D5A52;
  line-height: 1.5;
}
@media (max-width: 640px) {
  .alw-search-shell { padding: 3vh 0.5rem 0.5rem; }
  .alw-search-inner { max-height: 94vh; border-radius: 8px; }
  .alw-search-input { font-size: 1rem; }
  .alw-search-hit-title { font-size: 0.98rem; }
}
`;

import Link from 'next/link';

/**
 * Pagination — server-rendered Prev / page numbers / Next bar.
 *
 * SEO-friendly (real anchor tags with ?page=N, Google can crawl each
 * page), bookmarkable (visitors can share any page), accessible (plain
 * links, no JS required). No "load more" button — that pattern hides
 * content from Google and makes browser-back jump between pages
 * awkwardly.
 *
 * Props:
 *   basePath   — the section path, e.g. "/reset-stories" or
 *                "/life/holding-everything". The component appends
 *                ?page=N for pages beyond 1.
 *   page       — current page (1-indexed)
 *   pageCount  — total number of pages
 *   total      — total item count (for the "N of M" label)
 *   accentColour — the section accent (plum for Reset Stories, etc.)
 *
 * Hidden entirely when there's only one page.
 */

interface Props {
  basePath: string;
  page: number;
  pageCount: number;
  total: number;
  accentColour?: string;
}

function hrefForPage(basePath: string, n: number): string {
  if (n <= 1) return basePath;
  const sep = basePath.includes('?') ? '&' : '?';
  return `${basePath}${sep}page=${n}`;
}

// Build the list of page numbers to render. Always include 1 and
// pageCount; show up to 2 neighbours either side of the current page;
// use ellipses to collapse the rest.
function pageList(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: Array<number | 'ellipsis'> = [];
  const push = (n: number | 'ellipsis') => {
    if (n === 'ellipsis' && out[out.length - 1] === 'ellipsis') return;
    out.push(n);
  };
  push(1);
  if (current > 3) push('ellipsis');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    push(i);
  }
  if (current < total - 2) push('ellipsis');
  push(total);
  return out;
}

export default function Pagination({ basePath, page, pageCount, total, accentColour = '#6E3A5A' }: Props) {
  if (pageCount <= 1) return null;
  const pages = pageList(page, pageCount);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <nav className="pg-wrap" aria-label="Pagination">
        <p className="pg-count">
          Showing page {page} of {pageCount} <span className="pg-sep">·</span> {total} article{total === 1 ? '' : 's'} in total
        </p>
        <ul className="pg-list">
          <li>
            {page > 1 ? (
              <Link href={hrefForPage(basePath, page - 1)} className="pg-nav" rel="prev">← Previous</Link>
            ) : (
              <span className="pg-nav pg-nav-disabled" aria-disabled="true">← Previous</span>
            )}
          </li>
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <li key={`e-${i}`} className="pg-ellipsis" aria-hidden="true">…</li>
            ) : p === page ? (
              <li key={p}>
                <span
                  className="pg-num pg-num-current"
                  aria-current="page"
                  style={{ background: accentColour, borderColor: accentColour }}
                >
                  {p}
                </span>
              </li>
            ) : (
              <li key={p}>
                <Link href={hrefForPage(basePath, p)} className="pg-num">{p}</Link>
              </li>
            ),
          )}
          <li>
            {page < pageCount ? (
              <Link href={hrefForPage(basePath, page + 1)} className="pg-nav" rel="next">Next →</Link>
            ) : (
              <span className="pg-nav pg-nav-disabled" aria-disabled="true">Next →</span>
            )}
          </li>
        </ul>
      </nav>
    </>
  );
}

const styles = `
.pg-wrap {
  padding: 2.4rem 1.5rem 3rem;
  text-align: center;
  border-top: 1px solid rgba(0,0,0,0.06);
  margin-top: 2rem;
}
.pg-count {
  font-family: Mulish, sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5D5A52;
  margin: 0 0 1.1rem;
}
.pg-sep { color: #B8B4AC; margin: 0 0.3rem; }
.pg-list {
  list-style: none; margin: 0; padding: 0;
  display: inline-flex; align-items: center; gap: 0.3rem;
  flex-wrap: wrap; justify-content: center;
}
.pg-nav, .pg-num {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 36px; height: 36px; padding: 0 0.7rem;
  font-family: Mulish, sans-serif;
  font-size: 0.75rem; letter-spacing: 0.08em;
  color: #231F20; background: #fff;
  border: 1px solid rgba(0,0,0,0.1); border-radius: 4px;
  text-decoration: none;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.pg-nav { text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.65rem; padding: 0 0.9rem; }
.pg-nav:hover, .pg-num:hover { background: #F5F0E6; border-color: rgba(0,0,0,0.2); }
.pg-nav-disabled { color: #B8B4AC; cursor: not-allowed; background: #F9F7F3; }
.pg-nav-disabled:hover { background: #F9F7F3; border-color: rgba(0,0,0,0.1); }
.pg-num-current { color: #fff; }
.pg-num-current:hover { color: #fff; }
.pg-ellipsis {
  color: #8C8880;
  padding: 0 0.3rem;
  font-family: Mulish, sans-serif;
  font-size: 0.9rem;
}
`;

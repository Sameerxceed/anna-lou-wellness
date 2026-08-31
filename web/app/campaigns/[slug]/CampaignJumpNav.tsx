'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * CampaignJumpNav — sticky section nav rendered in the PARENT page,
 * pointing at headings inside the sandboxed iframe.
 *
 * Anna 31 Aug: pasted a sticky-nav snippet into the CMS entry, but
 * `position: fixed` inside a sandboxed iframe sticks to the iframe's
 * viewport (which is the whole iframe box because auto-height renders
 * everything at once), not the browser viewport. The snippet appeared
 * once when the top of the iframe scrolled into view then vanished.
 *
 * This component renders the same nav at the parent level so
 * `position: fixed` actually tracks the browser viewport, then finds
 * the target headings inside the iframe (allow-same-origin lets us
 * read iframe.contentDocument) and scrolls the parent window to each
 * heading's Y position on click.
 */

export interface JumpNavSection {
  /** Case-insensitive substring to find in a heading's text content */
  match: string;
  /** Label shown in the nav */
  label: string;
}

interface Props {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  sections: JumpNavSection[];
  bookHref: string;
  bookText: string;
  /** Extra breathing room above the section on click, in px */
  extraOffset?: number;
  /** Scroll distance in px before the bar slides in */
  showAfter?: number;
}

interface ResolvedSection {
  label: string;
  el: HTMLElement;
}

export default function CampaignJumpNav({
  iframeRef,
  sections,
  bookHref,
  bookText,
  extraOffset = 24,
  showAfter = 600,
}: Props) {
  const [resolved, setResolved] = useState<ResolvedSection[]>([]);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [siteHeaderH, setSiteHeaderH] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  // Site header (#mainNav) is sticky at top:0. Measure its height so the
  // jump nav sits directly beneath it instead of overlapping.
  useEffect(() => {
    const measure = () => {
      const el = document.getElementById('mainNav');
      setSiteHeaderH(el ? el.getBoundingClientRect().height : 0);
    };
    measure();
    window.addEventListener('resize', measure);
    const interval = window.setInterval(measure, 1500);
    return () => {
      window.removeEventListener('resize', measure);
      window.clearInterval(interval);
    };
  }, []);

  // Resolve sections by finding matching headings inside the iframe.
  // Retries as the iframe content loads.
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const resolve = () => {
      if (cancelled) return;
      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument;
      if (!doc || !doc.body || doc.body.childElementCount === 0) {
        if (attempts++ < 20) window.setTimeout(resolve, 300);
        return;
      }
      const all = Array.from(doc.querySelectorAll('h1, h2, h3, h4')) as HTMLElement[];
      const found: ResolvedSection[] = [];
      sections.forEach((spec) => {
        const needle = spec.match.toLowerCase();
        const el = all.find((h) => (h.textContent || '').toLowerCase().includes(needle));
        if (el) found.push({ label: spec.label, el });
      });
      if (found.length < 3) {
        if (attempts++ < 20) window.setTimeout(resolve, 300);
        return;
      }
      setResolved(found);
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [iframeRef, sections]);

  // Show/hide the bar based on scroll position + track active section.
  useEffect(() => {
    if (resolved.length === 0) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onScroll = () => {
      setVisible(window.pageYOffset > showAfter);
      // Active section = last one whose top is above the viewport midline
      const midline = window.pageYOffset + window.innerHeight * 0.35;
      const iframeTop = iframe.getBoundingClientRect().top + window.pageYOffset;
      let idx = 0;
      for (let i = 0; i < resolved.length; i++) {
        const yInParent = iframeTop + resolved[i].el.offsetTop;
        if (yInParent <= midline) idx = i;
        else break;
      }
      setActiveIdx(idx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [resolved, iframeRef, showAfter]);

  // Close mobile panel when clicking outside
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const scrollToSection = useCallback(
    (idx: number) => {
      const iframe = iframeRef.current;
      const target = resolved[idx]?.el;
      if (!iframe || !target) return;
      const iframeTop = iframe.getBoundingClientRect().top + window.pageYOffset;
      const navHeight = navRef.current?.offsetHeight || 0;
      // Account for BOTH stacked bars: site header + jump nav.
      const targetY = iframeTop + target.offsetTop - siteHeaderH - navHeight - extraOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      setOpen(false);
    },
    [iframeRef, resolved, extraOffset, siteHeaderH],
  );

  const handleBookClick = useCallback(
    (e: React.MouseEvent) => {
      // If bookHref starts with # → scroll to the matching id inside the iframe
      if (bookHref.startsWith('#')) {
        e.preventDefault();
        const id = bookHref.slice(1);
        const iframe = iframeRef.current;
        const doc = iframe?.contentDocument;
        const target = doc?.getElementById(id);
        if (target && iframe) {
          const iframeTop = iframe.getBoundingClientRect().top + window.pageYOffset;
          const navHeight = navRef.current?.offsetHeight || 0;
          const targetY = iframeTop + target.offsetTop - siteHeaderH - navHeight - extraOffset;
          window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        }
        setOpen(false);
      }
      // otherwise let the anchor navigate normally
    },
    [bookHref, iframeRef, extraOffset, siteHeaderH],
  );

  const activeLabel = useMemo(
    () => resolved[activeIdx]?.label || (resolved[0]?.label ?? ''),
    [resolved, activeIdx],
  );

  if (resolved.length < 3) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <nav
        ref={navRef}
        className={`cj-nav${visible ? ' cj-visible' : ''}${open ? ' cj-open' : ''}`}
        aria-label="Sections of this page"
        style={{ top: siteHeaderH }}
      >
        <div className="cj-inner">
          <button
            type="button"
            className="cj-toggle"
            aria-expanded={open}
            aria-controls="cj-panel"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="cj-toggle-label">Jump to</span>
            <span className="cj-toggle-current">{activeLabel}</span>
            <span className="cj-chevron" aria-hidden="true" />
          </button>
          <div className="cj-panel" id="cj-panel">
            <ul className="cj-list">
              {resolved.map((s, i) => (
                <li key={s.label}>
                  <button
                    type="button"
                    className="cj-link"
                    aria-current={i === activeIdx ? 'true' : undefined}
                    onClick={() => scrollToSection(i)}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <a
            className="cj-cta"
            href={bookHref}
            onClick={handleBookClick}
            target={bookHref.startsWith('http') ? '_blank' : undefined}
            rel={bookHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {bookText}
          </a>
        </div>
      </nav>
    </>
  );
}

const styles = `
:root { --cj-bg:#F5F2ED; --cj-ink:#2E1B2C; --cj-plum:#5C2A50; --cj-muted:#7A6B76; --cj-line:rgba(46,27,44,0.16); --cj-gold:#E0A32E; }
.cj-nav { position:fixed; top:0; left:0; right:0; z-index:900; background:var(--cj-bg); border-bottom:1px solid var(--cj-line); transform:translateY(-102%); transition:transform 260ms ease; font-family:'Work Sans',system-ui,sans-serif; }
.cj-nav.cj-visible { transform:translateY(0); }
.cj-inner { max-width:1180px; margin:0 auto; padding:0 20px; display:flex; align-items:center; gap:16px; min-height:54px; }
.cj-toggle { flex:1 1 auto; min-width:0; display:flex; align-items:center; gap:10px; background:none; border:0; padding:15px 0; font:inherit; font-size:15px; color:var(--cj-ink); cursor:pointer; text-align:left; }
.cj-toggle-label { flex:0 0 auto; color:var(--cj-muted); letter-spacing:.04em; }
.cj-toggle-current { flex:1 1 auto; min-width:0; color:var(--cj-plum); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cj-chevron { flex:0 0 auto; width:9px; height:9px; border-right:1.5px solid var(--cj-muted); border-bottom:1.5px solid var(--cj-muted); transform:rotate(45deg) translate(-2px,-2px); transition:transform 200ms ease; }
.cj-toggle[aria-expanded="true"] .cj-chevron { transform:rotate(225deg) translate(-3px,-3px); }
.cj-list { list-style:none; margin:0; padding:0; }
.cj-link { display:block; width:100%; padding:14px 0; font-size:15px; line-height:1.3; color:var(--cj-ink); background:none; border:0; border-bottom:1px solid var(--cj-line); text-align:left; font-family:inherit; cursor:pointer; }
.cj-link[aria-current="true"] { color:var(--cj-plum); }
.cj-cta { flex:0 0 auto; display:inline-block; padding:10px 18px; border-radius:999px; background:var(--cj-plum); color:#fff; font-size:14px; letter-spacing:.02em; text-decoration:none; white-space:nowrap; }
.cj-cta:hover { background:#4B2142; color:#fff; }
@media (max-width:859px) {
  .cj-panel { display:none; position:absolute; left:0; right:0; top:100%; border-top:1px solid var(--cj-line); padding:2px 20px 14px; max-height:60vh; overflow-y:auto; background:var(--cj-bg); box-shadow:0 8px 20px rgba(0,0,0,0.06); }
  .cj-nav.cj-open .cj-panel { display:block; }
  .cj-list > li:last-child .cj-link { border-bottom:0; }
}
@media (min-width:860px) {
  .cj-toggle { display:none; }
  .cj-panel { flex:1 1 auto; min-width:0; display:block; }
  .cj-list { display:flex; align-items:center; gap:28px; overflow-x:auto; scrollbar-width:none; }
  .cj-list::-webkit-scrollbar { display:none; }
  .cj-link { padding:18px 0; border-bottom:2px solid transparent; white-space:nowrap; color:var(--cj-muted); }
  .cj-link:hover { color:var(--cj-ink); }
  .cj-link[aria-current="true"] { color:var(--cj-plum); border-bottom-color:var(--cj-gold); }
}
`;

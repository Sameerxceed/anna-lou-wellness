/**
 * SeoFilesPage — admin sidebar page that lists every machine-readable
 * file the public site exposes for search engines, AI crawlers, and
 * shopping engines. Anna can tap any row to open the file in a new tab
 * and see exactly what Google / ChatGPT / Perplexity etc. read.
 *
 * Pure reference page — no auth-protected API calls (avoids the v5
 * cookie issue that's blocking Quick Photos). Just static links + copy.
 */

import { useState, useEffect, useRef } from 'react';

// The public site URL. Mirrors the same heuristic as ViewLivePanel —
// on production-cms hosting the new site lives at staging.<apex> until
// the Squarespace apex is cut over.
const PUBLIC_SITE_URL = (() => {
  if (typeof window === 'undefined') return 'https://staging.annalouwellness.com';
  const host = window.location.hostname;
  if (host === 'cms.annalouwellness.com') return 'https://staging.annalouwellness.com';
  if (host === 'staging.cms.annalouwellness.com') return 'https://staging.annalouwellness.com';
  if (host.startsWith('staging.cms.')) return `https://staging.${host.slice(12)}`;
  if (host.startsWith('cms.')) return `https://${host.slice(4)}`;
  return 'https://staging.annalouwellness.com';
})();

type FileEntry = {
  name: string;          // user-facing label, e.g. "Sitemap"
  path: string;          // url path on the public site, e.g. "/sitemap.xml"
  audience: string;      // who reads this file
  purpose: string;       // one-paragraph plain English
  updates: string;       // when this file changes
  open?: boolean;        // null for static-only files
};

const GROUPS: { groupTitle: string; groupBlurb: string; files: FileEntry[] }[] = [
  {
    groupTitle: 'For Google + traditional search engines',
    groupBlurb: 'These tell Google which pages exist on your site, which to index, and which to skip. Google fetches them automatically — you do not need to submit anything.',
    files: [
      {
        name: 'Sitemap',
        path: '/sitemap.xml',
        audience: 'Google, Bing, all search crawlers',
        purpose: 'Master list of every page on your site — auto-includes new programmes, articles, products, experiences, Page Builder pages, and editorial entries you create. Google uses this to discover content and prioritise what to index.',
        updates: 'Automatically when you add or publish anything in: Articles, Products, Programmes, Experiences, Page Builder pages. No code change needed for new entries in those collections.',
      },
      {
        name: 'Robots.txt',
        path: '/robots.txt',
        audience: 'All crawlers (Google, Bing, ChatGPT, Perplexity, etc.)',
        purpose: 'Tells crawlers which pages they are and are not allowed to read. Currently allows everything except admin areas, the cart, and member-only Reset Room pages.',
        updates: 'Manual — Sameer edits the rules if you ever want to hide a section from search.',
      },
      {
        name: 'RSS feed',
        path: '/feed.xml',
        audience: 'RSS readers, Substack, Apple News, news aggregators',
        purpose: 'Stream of your latest Reset Stories and articles in a format any feed reader can subscribe to. People can follow your writing without checking the site.',
        updates: 'Automatically when you publish a new article.',
      },
    ],
  },
  {
    groupTitle: 'For AI engines (ChatGPT, Perplexity, Claude)',
    groupBlurb: 'New file types AI search engines look for. They want a clean, structured digest of your site — what you do, who you serve, how to find your work. Done well, your site shows up in AI answers when users ask "best somatic coach London", "trauma-informed retreats", etc.',
    files: [
      {
        name: 'llms.txt',
        path: '/llms.txt',
        audience: 'ChatGPT, Claude, Perplexity, Gemini, OpenAI Search',
        purpose: 'Plain-text guide for AI engines: what your site is about, the most important pages, your unique offerings. AI engines that support this format use it to give better summaries when users ask about you or your topics.',
        updates: 'Automatically as you publish content — Sameer maintains the template.',
      },
    ],
  },
  {
    groupTitle: 'For shopping engines (Google Shopping, OpenAI Agentic Commerce)',
    groupBlurb: 'Structured product feeds so shopping engines can show your jewellery + courses in their results. Google Shopping pulls from products.xml; OpenAI is rolling out an "Agentic Commerce" feature that reads ai-products.jsonl.',
    files: [
      {
        name: 'Google Merchant feed',
        path: '/products.xml',
        audience: 'Google Shopping, Google Merchant Center',
        purpose: 'List of all your shop products in Google\'s required XML format. Once we connect Merchant Center (Anna\'s set-up task), Google can show ALW products in shopping results with photos, prices, and stock status.',
        updates: 'Automatically when you add or edit products in the Shop · Product collection.',
      },
      {
        name: 'OpenAI product feed (jsonl)',
        path: '/ai-products.jsonl',
        audience: 'OpenAI Agentic Commerce',
        purpose: 'Structured product list in the exact format OpenAI requires for ChatGPT shopping integration. Anna applied for merchant status separately — once approved, OpenAI will fetch this file.',
        updates: 'Automatically when products change.',
      },
      {
        name: 'OpenAI product feed (json)',
        path: '/ai-products.json',
        audience: 'OpenAI Agentic Commerce (alternative format)',
        purpose: 'Same data as the .jsonl file, in standard JSON format. Some clients prefer one over the other.',
        updates: 'Automatically when products change.',
      },
    ],
  },
  {
    groupTitle: 'Embedded in pages (no standalone file)',
    groupBlurb: 'Some SEO/AI data lives inside each page\'s HTML rather than as a separate file. Right-click any page on the live site → View Page Source → search for "application/ld+json" to see it.',
    files: [
      {
        name: 'Schema.org JSON-LD',
        path: '',
        audience: 'Google rich results, Pinterest, AI crawlers',
        purpose: 'Structured data embedded in every page — Article, Service, Product, FAQ, Review, AggregateRating, BreadcrumbList, LocalBusiness, Person, WebSite. Lets Google show "rich snippets" (star ratings on reviews, FAQ accordions in search results, recipe-card-style summaries).',
        updates: 'Automatically — every page emits the right schema type based on its content.',
      },
      {
        name: 'Open Graph + Twitter Card tags',
        path: '',
        audience: 'Instagram, Facebook, WhatsApp, Twitter, LinkedIn preview cards',
        purpose: 'Meta tags in every page\'s <head> that control how the page looks when shared on social. Title, description, hero image. Comes from the SEO title / SEO description / hero image fields you fill in each entry.',
        updates: 'Automatically based on each entry\'s SEO fields. The "Generate SEO" button speeds up filling these.',
      },
    ],
  },
];

const styles = {
  page: { padding: 24, maxWidth: 980, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' } as React.CSSProperties,
  h1: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 32, margin: '8px 0 4px' } as React.CSSProperties,
  intro: { color: '#666687', fontSize: 13, marginBottom: 28, lineHeight: 1.6 } as React.CSSProperties,
  groupSection: { marginBottom: 36 } as React.CSSProperties,
  groupTitle: { fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' as const, fontSize: 22, color: '#231F20', marginBottom: 4 } as React.CSSProperties,
  groupBlurb: { fontSize: 13, color: '#666687', marginBottom: 16, lineHeight: 1.6 } as React.CSSProperties,
  card: { background: '#fff', border: '1px solid #DCDCE4', borderRadius: 6, padding: '14px 18px 16px', marginBottom: 10 } as React.CSSProperties,
  cardHeader: { display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' as const, marginBottom: 6 } as React.CSSProperties,
  cardName: { fontSize: 15, fontWeight: 600, color: '#32324D' } as React.CSSProperties,
  cardPath: { fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#6E3A5A', background: '#F6EAF0', padding: '2px 8px', borderRadius: 3 } as React.CSSProperties,
  cardAudience: { fontSize: 11, color: '#666687', fontStyle: 'italic' as const } as React.CSSProperties,
  cardPurpose: { fontSize: 13, color: '#3D3D3A', lineHeight: 1.55, margin: '6px 0' } as React.CSSProperties,
  cardUpdates: { fontSize: 12, color: '#666687', marginBottom: 10 } as React.CSSProperties,
  buttonRow: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginTop: 6 } as React.CSSProperties,
  viewButton: { padding: '6px 12px', background: '#0A7A3B', color: '#fff', textDecoration: 'none', borderRadius: 3, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' } as React.CSSProperties,
  copyButton: { padding: '6px 12px', background: '#fff', color: '#6E3A5A', border: '1px solid #6E3A5A', borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
  copied: { color: '#0A7A3B', borderColor: '#0A7A3B' } as React.CSSProperties,
  noFile: { fontSize: 12, color: '#8C8880', fontStyle: 'italic' as const } as React.CSSProperties,
};

// Backfill state polled from /api/seo-generator/backfill-status. credentials:include
// sends the httpOnly admin cookie automatically — Strapi v5 dropped Bearer-token
// support in localStorage.
type BackfillState = {
  status: 'idle' | 'running' | 'done' | 'error';
  startedAt: string | null;
  finishedAt: string | null;
  current: string;
  processed: number;
  updated: number;
  skipped: number;
  errors: number;
  lastLog: string[];
  errorMessage: string;
};

// Grab the admin JWT from wherever Strapi v5 stashed it in this build.
// Belt-and-suspenders alongside credentials:'include' so the server-side
// verifyAdminJwt can find the token via either the Authorization header
// or the cookie. Same pattern as HelpFab + SiteUrlsPage.
function getAdminJwt(): string {
  if (typeof window === 'undefined') return '';
  const raw =
    window.sessionStorage.getItem('jwtToken') ||
    window.localStorage.getItem('jwtToken') ||
    (() => {
      try {
        const ui = window.sessionStorage.getItem('strapi-userInfo') ||
          window.localStorage.getItem('strapi-userInfo');
        if (ui) return JSON.parse(ui)?.token || '';
      } catch { /* ignore */ }
      return '';
    })();
  return String(raw || '').replace(/^"|"$/g, '');
}

function authHeaders(): Record<string, string> {
  const jwt = getAdminJwt();
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}

export default function SeoFilesPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [backfill, setBackfill] = useState<BackfillState | null>(null);
  const [starting, setStarting] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/seo-generator/backfill-status', {
        credentials: 'include',
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.state) setBackfill(data.state);
    } catch {
      // network blip — keep polling
    }
  };

  // On mount, fetch once to know if a backfill is already running.
  useEffect(() => {
    fetchStatus();
  }, []);

  // Poll every 2s while running.
  useEffect(() => {
    if (backfill?.status === 'running') {
      pollRef.current = window.setInterval(fetchStatus, 2000);
      return () => {
        if (pollRef.current !== null) window.clearInterval(pollRef.current);
      };
    }
    return undefined;
  }, [backfill?.status]);

  const startBackfill = async () => {
    setTriggerError(null);
    setStarting(true);
    try {
      const res = await fetch('/api/seo-generator/backfill-start', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
      }
      // Force an immediate status fetch so the UI shows running state right away.
      await fetchStatus();
    } catch (err: any) {
      setTriggerError(err?.message || 'Failed to start');
    } finally {
      setStarting(false);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied((c) => (c === url ? null : c)), 1500);
    } catch {/* ignore */}
  };

  const running = backfill?.status === 'running';

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>SEO &amp; AI files</h1>
      <p style={styles.intro}>
        Everything your site exposes to Google, ChatGPT, Perplexity, Gemini, and the shopping engines. Tap <strong>View</strong> to open any file in a new tab and see exactly what they read. These files update automatically as you publish content — there is nothing here for you to maintain manually.
      </p>

      {/* Bulk SEO backfill panel */}
      <section style={{ background: '#fff', border: '1px solid #DCDCE4', borderRadius: 6, padding: 18, marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 22, color: '#231F20', margin: '0 0 6px' }}>Bulk fill missing SEO</h2>
        <p style={{ fontSize: 13, color: '#666687', lineHeight: 1.55, margin: '0 0 12px' }}>
          Scans Articles, Programmes, Experiences, Coaching Sessions, Generic Pages, and Page Builder entries.
          Anything missing both SEO title and description gets one written by Claude using the entry's name + body text.
          Entries with SEO already filled are <strong>never overwritten</strong>. Takes ~1 second per entry.
        </p>

        {triggerError && (
          <div style={{ padding: '10px 12px', background: '#FFF0F0', border: '1px solid #FFB3B3', color: '#B33A3A', fontSize: 12, marginBottom: 10, borderRadius: 4 }}>
            {triggerError}
          </div>
        )}

        {!backfill || backfill.status === 'idle' ? (
          <button
            type="button"
            onClick={startBackfill}
            disabled={starting}
            style={{
              padding: '10px 18px', background: starting ? '#c8c4bc' : '#6E3A5A', color: '#fff',
              border: 'none', borderRadius: 3, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: starting ? 'wait' : 'pointer',
            }}
          >
            {starting ? 'Starting...' : 'Run bulk SEO backfill'}
          </button>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10, fontSize: 13, color: '#3D3D3A' }}>
              <span><strong>Status:</strong> {backfill.status}</span>
              <span><strong>Processed:</strong> {backfill.processed}</span>
              <span><strong>Filled:</strong> {backfill.updated}</span>
              <span><strong>Skipped:</strong> {backfill.skipped}</span>
              <span><strong>Errors:</strong> {backfill.errors}</span>
            </div>
            {running && backfill.current && (
              <p style={{ fontSize: 12, color: '#6E3A5A', margin: '0 0 8px', fontStyle: 'italic' }}>
                Currently: {backfill.current}
              </p>
            )}
            {backfill.status === 'done' && (
              <p style={{ fontSize: 12, color: '#0A7A3B', margin: '0 0 8px' }}>
                Finished. {backfill.updated} entries filled, {backfill.skipped} already had SEO, {backfill.errors} errors.
              </p>
            )}
            {backfill.status === 'error' && backfill.errorMessage && (
              <p style={{ fontSize: 12, color: '#B33A3A', margin: '0 0 8px' }}>
                {backfill.errorMessage}
              </p>
            )}
            {backfill.lastLog && backfill.lastLog.length > 0 && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ fontSize: 12, color: '#666687', cursor: 'pointer' }}>Recent activity ({backfill.lastLog.length})</summary>
                <pre style={{ fontSize: 11, background: '#F6F6F9', padding: 10, borderRadius: 3, maxHeight: 200, overflow: 'auto', margin: '8px 0 0' }}>
                  {backfill.lastLog.join('\n')}
                </pre>
              </details>
            )}
            {!running && (
              <button
                type="button"
                onClick={startBackfill}
                disabled={starting}
                style={{
                  marginTop: 10, padding: '8px 14px', background: '#fff', color: '#6E3A5A',
                  border: '1px solid #6E3A5A', borderRadius: 3, fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                }}
              >
                Run again
              </button>
            )}
          </div>
        )}
      </section>

      {GROUPS.map((group) => (
        <section key={group.groupTitle} style={styles.groupSection}>
          <h2 style={styles.groupTitle}>{group.groupTitle}</h2>
          <p style={styles.groupBlurb}>{group.groupBlurb}</p>
          {group.files.map((f) => {
            const fullUrl = f.path ? `${PUBLIC_SITE_URL}${f.path}` : '';
            return (
              <article key={f.name} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardName}>{f.name}</span>
                  {f.path ? <span style={styles.cardPath}>{f.path}</span> : <span style={styles.noFile}>(embedded in every page)</span>}
                </div>
                <p style={styles.cardAudience}><strong>Who reads it:</strong> {f.audience}</p>
                <p style={styles.cardPurpose}>{f.purpose}</p>
                <p style={styles.cardUpdates}><strong>Updates:</strong> {f.updates}</p>
                {f.path && (
                  <div style={styles.buttonRow}>
                    <a href={fullUrl} target="_blank" rel="noopener" style={styles.viewButton}>View file →</a>
                    <button
                      type="button"
                      onClick={() => copyUrl(fullUrl)}
                      style={{ ...styles.copyButton, ...(copied === fullUrl ? styles.copied : {}) } as React.CSSProperties}
                    >
                      {copied === fullUrl ? 'Copied' : 'Copy URL'}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      ))}

      <div style={{ marginTop: 32, padding: '16px 18px', background: '#F6F6F9', borderRadius: 6, fontSize: 12, color: '#666687', lineHeight: 1.6 }}>
        <strong style={{ color: '#32324D' }}>A note on visibility:</strong> Most of these files are not meant to be human-readable. They are formatted for machines. Don&rsquo;t worry if they look like raw code or XML — that&rsquo;s the point. As long as the files load, the crawlers are happy.
      </div>
    </div>
  );
}
